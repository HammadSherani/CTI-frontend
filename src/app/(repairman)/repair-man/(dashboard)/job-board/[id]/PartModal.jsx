import React, { useEffect, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { useSelector } from "react-redux";

function PartModal({ isOpen, onClose, children, jobId, chatId,  isQuotationFlow = false, setPartsArray  }) {
    const [parts, setParts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const storageKey = useMemo(() => {
        if (jobId) {
            return `selectedParts_job_${jobId}`;
        } else {
            return 'selectedParts_quotation_chat_' + chatId;
        }
    }, [jobId, chatId]);


    
    
    const [selectedParts, setSelectedParts] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    });

    
    console.log('selectedParts', selectedParts);
    
    
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        model: '',
        minPrice: '',
        maxPrice: '',
        stockStatus: '',
        search: ''
    });

    const [searchInput, setSearchInput] = useState('');

    const [filterOptions, setFilterOptions] = useState({
        categories: [],
        brands: [],
        models: [],
        stockStatuses: []
    });

    const { token } = useSelector((state) => state.auth);
    const limit = 20;

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        const parsedSaved = saved ? JSON.parse(saved) : [];
        setSelectedParts(parsedSaved);
        if (setPartsArray && typeof setPartsArray === 'function') {
            setPartsArray(parsedSaved);
        }
    }, [storageKey]);

    useEffect(() => {
        if (isOpen) {
            fetchFilterOptions();
            setCurrentPage(1);
            fetchParts();
        }
    }, [isOpen, jobId, isQuotationFlow]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput }));
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (!isOpen) return;
        
        if (currentPage === 1) {
            fetchParts();
        } else {
            setCurrentPage(1);
        }
    }, [filters]);

    useEffect(() => {
        if (isOpen && currentPage !== 1) {
            fetchParts();
        }
    }, [currentPage]);

    const fetchFilterOptions = async () => {
        try {
            const { data } = await axiosInstance.get('/repairman/parts/filter-options', {
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            });

            if (data.success) {
                setFilterOptions({
                    categories: data.filterOptions.categories || [],
                    brands: data.filterOptions.brands || [],
                    models: data.filterOptions.models || [],
                    stockStatuses: data.filterOptions.stockStatuses || []
                });
            }
        } catch (error) {
            handleError(error);
        }
    };

    const fetchParts = async () => {
        try {
            setIsLoading(true);

            const params = new URLSearchParams();

            if (filters.category) params.append('category', filters.category);
            if (filters.brand) params.append('brand', filters.brand);
            if (filters.model) params.append('model', filters.model);
            if (filters.stockStatus) params.append('stockStatus', filters.stockStatus);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.search) params.append('search', filters.search);

            params.append('page', currentPage.toString());
            params.append('limit', limit.toString());

            const endpoint = jobId
                ? `/repairman/parts/${jobId}?${params.toString()}`
                : `/repairman/parts?${params.toString()}`;

            const { data } = await axiosInstance.get(endpoint, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            });

            if (data.success) {
                setParts(data.parts || []);
                setPagination(data.pagination || null);
            }
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            brand: '',
            model: '',
            minPrice: '',
            maxPrice: '',
            stockStatus: '',
            search: ''
        });
        setSearchInput('');
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatPrice = (price) => {
        return `₺${price?.toLocaleString()}`;
    };

    const handlePartSelect = (part) => {
        const selectedPartData = {
            id: part._id,
            name: part.name,
            brand: part.brand?.name,
            model: part.model?.name,
            category: part.category?.name,
            partType: part.partType,
            warranty: part.warranty,
            condition: part.condition,
            price: part.price,
            sku: part.sku,
        };

        setSelectedParts(prev => {
            const isAlreadySelected = prev.some(p => p.id === part._id);

            let updatedParts;
            if (isAlreadySelected) {
                updatedParts = prev.filter(p => p.id !== part._id);
            } else {
                updatedParts = [...prev, selectedPartData];
            }

            localStorage.setItem(storageKey, JSON.stringify(updatedParts));
            if (setPartsArray && typeof setPartsArray === 'function') {
                setPartsArray(updatedParts);
            }
            return updatedParts;
        });
    };

    const isPartSelected = (partId) => {
        return selectedParts.some(p => p.id === partId);
    };

    const getSelectedParts = () => {
        return selectedParts;
    };

    const clearSelectedParts = () => {
        setSelectedParts([]);
        localStorage.removeItem(storageKey);
        if (setPartsArray && typeof setPartsArray === 'function') {
            setPartsArray([]);
        }
    };

    useEffect(() => {
        if (onClose && typeof onClose === 'function') {
            // You can pass selected parts to parent when closing
            // This is handled by parent component
        }
    }, [selectedParts, onClose]);

    if (!isOpen) return null;

    const totalPages = pagination?.totalPages || 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white relative rounded-2xl shadow-xl w-full max-w-7xl h-[90vh] overflow-hidden relative flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Available Parts</h2>
                            <p className="text-xs text-gray-600 mt-1">
                                Select the parts you need for this {jobId ? 'job' : 'quotation'}
                                {selectedParts.length > 0 && (
                                    <span className="ml-2 text-primary-600 font-semibold">
                                        ({selectedParts.length} selected)
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={onClose}
                        >
                            <Icon icon="lets-icons:close-round" width="28" height="28" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Filters */}
                    <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Icon icon="heroicons:funnel" className="w-4 h-4" />
                                Filters
                            </h3>
                            <button
                                onClick={clearFilters}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-gray-700 mb-2 block">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search parts..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <Icon icon="heroicons:magnifying-glass" className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Category Filter */}
                        {filterOptions.categories.length > 0 && (
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-gray-700 mb-2 block">Category</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All Categories</option>
                                    {filterOptions.categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Brand Filter */}
                        {filterOptions.brands.length > 0 && (
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-gray-700 mb-2 block">Brand</label>
                                <select
                                    value={filters.brand}
                                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All Brands</option>
                                    {filterOptions.brands.map(brand => (
                                        <option key={brand._id} value={brand._id}>{brand.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Model Filter */}
                        {filterOptions.models.length > 0 && (
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-gray-700 mb-2 block">Model</label>
                                <select
                                    value={filters.model}
                                    onChange={(e) => handleFilterChange('model', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All Models</option>
                                    {filterOptions.models.map(model => (
                                        <option key={model._id} value={model._id}>{model.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Stock Status Filter */}
                        {filterOptions.stockStatuses.length > 0 && (
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-gray-700 mb-2 block">Stock Status</label>
                                <select
                                    value={filters.stockStatus}
                                    onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All Stock</option>
                                    {filterOptions.stockStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Price Range Filter */}
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-gray-700 mb-2 block">Price Range</label>
                            <select
                                value={filters.minPrice && filters.maxPrice ? `${filters.minPrice}-${filters.maxPrice}` : ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value) {
                                        const [min, max] = value.split('-');
                                        handleFilterChange('minPrice', min);
                                        handleFilterChange('maxPrice', max);
                                    } else {
                                        handleFilterChange('minPrice', '');
                                        handleFilterChange('maxPrice', '');
                                    }
                                }}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Prices</option>
                                <option value="0-100">₺0 - ₺100</option>
                                <option value="100-500">₺100 - ₺500</option>
                                <option value="500-1000">₺500 - ₺1,000</option>
                                <option value="1000-5000">₺1,000 - ₺5,000</option>
                                <option value="5000-999999">₺5,000+</option>
                            </select>
                        </div>
                    </div>

                    {/* Parts Grid */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: limit }, (_, i) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                                        <div className="h-48 bg-gray-200"></div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                            <div className="h-10 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : parts && parts.length > 0 ? (
                            <>
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Showing <span className="font-semibold">{parts.length}</span> parts
                                        {pagination && (
                                            <span className="ml-2 text-xs text-gray-500">
                                                (Page {currentPage} of {totalPages})
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {parts.map((part) => {
                                        const isSelected = isPartSelected(part._id);

                                        return (
                                            <div
                                                key={part._id}
                                                className={`bg-white border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 ${isSelected
                                                    ? 'border-primary-600 ring-2 ring-primary-200 shadow-lg'
                                                    : 'border-gray-200'
                                                    }`}
                                            >
                                                {/* Image Section */}
                                                <div className="relative h-48 bg-gray-50">
                                                    <img
                                                        src={part.images[0] || '/placeholder-part.png'}
                                                        alt={part.name}
                                                        className="w-full h-full object-contain p-4"
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-part.png';
                                                        }}
                                                    />
                                                    {isSelected && (
                                                        <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                                            <Icon icon="heroicons:check-circle-solid" className="w-4 h-4" />
                                                            Selected
                                                        </div>
                                                    )}
                                                    {part.isFeatured && !isSelected && (
                                                        <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                                            Featured
                                                        </span>
                                                    )}
                                                    {part.discount > 0 && (
                                                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                                            -{part.discount}%
                                                        </span>
                                                    )}
                                                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                                                        {part.stockStatus}
                                                    </div>
                                                </div>

                                                {/* Content Section */}
                                                <div className="p-4">
                                                    {/* Category Badge */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <img
                                                            src={part.category.icon}
                                                            alt={part.category.name}
                                                            className="w-5 h-5 object-contain"
                                                        />
                                                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                                                            {part.category.name}
                                                        </span>
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                                                        {part.name}
                                                    </h3>

                                                    {/* Brand & Model */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <img
                                                            src={part.brand.icon}
                                                            alt={part.brand.name}
                                                            className="w-5 h-5 object-contain"
                                                        />
                                                        <span className="text-sm text-gray-600">
                                                            {part.brand.name} • {part.model.name}
                                                        </span>
                                                    </div>

                                                    {/* Part Details */}
                                                    <div className="space-y-1.5 mb-3">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Icon icon="heroicons:shield-check" className="w-4 h-4 mr-1.5 text-green-600" />
                                                            <span className="font-medium text-green-600">{part.partType}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Icon icon="heroicons:clock" className="w-4 h-4 mr-1.5" />
                                                            <span>{part.warranty}</span>
                                                        </div>
                                                    </div>

                                                    {/* Price & Action */}
                                                    <div className="border-t border-gray-100 pt-3">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Repairman Price</p>
                                                                <p className="text-xl font-bold text-primary-600">
                                                                    {formatPrice(part.price)}
                                                                </p>
                                                            </div>
                                                            {part.rating > 0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <Icon icon="heroicons:star-solid" className="w-4 h-4 text-yellow-400" />
                                                                    <span className="text-sm font-medium">{part.rating}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={() => handlePartSelect(part)}
                                                            className={`w-full font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${isSelected
                                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                : 'bg-primary-600 hover:bg-primary-700 text-white'
                                                                }`}
                                                        >
                                                            <Icon
                                                                icon={isSelected ? "heroicons:check-circle" : "heroicons:plus"}
                                                                className="w-5 h-5"
                                                            />
                                                            {isSelected ? 'Selected' : 'Add to Bid'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="mt-6 flex items-center justify-center space-x-2 border-t border-gray-200 pt-4">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1 || isLoading}
                                            className="px-3 flex items-center py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-white"
                                        >
                                            <Icon icon="heroicons:chevron-left" className="w-4 h-4" />
                                            Previous
                                        </button>
                                        <span className="text-sm text-gray-700 px-3 py-2">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages || isLoading}
                                            className="px-3 flex items-center py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-white"
                                        >
                                            Next
                                            <Icon icon="heroicons:chevron-right" className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Icon icon="heroicons:cube" className="w-20 h-20 text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg font-medium">No parts found</p>
                                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* <div className="fixed w-full bottom-0 left-0 bg-white border-t border py-4">
                        this is fixed bar 
                </div> */}
            </div>
        </div>
    );
}

export default PartModal;