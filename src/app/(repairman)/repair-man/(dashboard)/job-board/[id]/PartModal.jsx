import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { useSelector } from "react-redux";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function PartModal({ isOpen, onClose, children, jobId }) {
    const [parts, setParts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedParts, setSelectedParts] = useState(() => {
        const saved = localStorage.getItem(`selectedParts_${jobId}`);
        return saved ? JSON.parse(saved) : [];
    });
    

    useEffect(() => {
        if (isOpen) {
            getRequiredPart();
        }
    }, [isOpen]);

    const { token } = useSelector((state) => state.auth);

    const getRequiredPart = async () => {
        try {
            setIsLoading(true);
            const { data } = await axiosInstance.get(`/repairman/parts/${jobId}`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            });
            setParts(data.parts);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
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
            
            localStorage.setItem(`selectedParts_${jobId}`, JSON.stringify(updatedParts));
            return updatedParts;
        });
    };

    const isPartSelected = (partId) => {
        return selectedParts.some(p => p.id === partId);
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden relative flex flex-col">
                
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Available Parts</h2>
                            <p className="text-xs text-gray-600 mt-1">
                                Select the parts you need for this job
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

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                                    <div className="h-32 bg-gray-200"></div>
                                    
                                    <div className="p-3 space-y-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                            <div className="h-5 w-20 bg-gray-200 rounded"></div>
                                        </div>
                                        
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                            <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                        </div>
                                        
                                        <div className="border-t border-gray-100 pt-2 mt-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="space-y-1">
                                                    <div className="h-2 w-16 bg-gray-200 rounded"></div>
                                                    <div className="h-5 w-20 bg-gray-200 rounded"></div>
                                                </div>
                                                <div className="h-4 w-10 bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="h-8 bg-gray-200 rounded-lg"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : parts && parts.length > 0 ? (
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={16}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            breakpoints={{
                                640: {
                                    slidesPerView: 2,
                                },
                                768: {
                                    slidesPerView: 3,
                                },
                                1024: {
                                    slidesPerView: 4,
                                },
                            }}
                            className="parts-swiper"
                        >
                            {parts.map((part) => {
                                const isSelected = isPartSelected(part._id);
                                
                                return (
                                    <SwiperSlide key={part._id}>
                                        <div className={`bg-white border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col ${
                                            isSelected 
                                                ? 'border-primary-600 ring-2 ring-primary-200 shadow-lg' 
                                                : 'border-gray-200'
                                        }`}>
                                            {/* Image Section */}
                                            <div className="relative h-32 bg-gray-50">
                                                <img
                                                    src={part.images[0] || '/placeholder-part.png'}
                                                    alt={part.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-part.png';
                                                    }}
                                                />
                                                {isSelected && (
                                                    <div className="absolute top-1 left-1 bg-primary-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                                                        <Icon icon="heroicons:check-circle-solid" className="w-3 h-3" />
                                                        Selected
                                                    </div>
                                                )}
                                                {part.isFeatured && !isSelected && (
                                                    <span className="absolute top-1 left-1 bg-yellow-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                                                        Featured
                                                    </span>
                                                )}
                                                {part.discount > 0 && (
                                                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                                                        -{part.discount}%
                                                    </span>
                                                )}
                                                <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                                    {part.stockStatus}
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="p-3 flex-1 flex flex-col">
                                                {/* Category Badge */}
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <img 
                                                        src={part.category.icon} 
                                                        alt={part.category.name}
                                                        className="w-4 h-4 object-contain"
                                                    />
                                                    <span className="text-[10px] font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                                                        {part.category.name}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-1">
                                                    {part.name}
                                                </h3>

                                                {/* Brand & Model */}
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <img 
                                                        src={part.brand.icon} 
                                                        alt={part.brand.name}
                                                        className="w-4 h-4 object-contain"
                                                    />
                                                    <span className="text-xs text-gray-600 truncate">
                                                        {part.brand.name} • {part.model.name}
                                                    </span>
                                                </div>

                                                {/* Part Details */}
                                                <div className="space-y-1 mb-2 flex-1">
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Icon icon="heroicons:shield-check" className="w-3 h-3 mr-1 text-green-600" />
                                                        <span className="font-medium text-green-600 text-[11px]">{part.partType}</span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Icon icon="heroicons:clock" className="w-3 h-3 mr-1" />
                                                        <span className="text-[11px]">{part.warranty}</span>
                                                    </div>
                                                </div>

                                                {/* Price & Action */}
                                                <div className="border-t border-gray-100 pt-2 mt-auto">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <p className="text-[9px] text-gray-500">Repairman Price</p>
                                                            <p className="text-lg font-bold text-primary-600">
                                                                {formatPrice(part.price)}
                                                            </p>
                                                        </div>
                                                        {part.rating > 0 && (
                                                            <div className="flex items-center gap-0.5">
                                                                <Icon icon="heroicons:star-solid" className="w-3 h-3 text-yellow-400" />
                                                                <span className="text-xs font-medium">{part.rating}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => handlePartSelect(part)}
                                                        className={`w-full font-medium py-1.5 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5 text-sm ${
                                                            isSelected
                                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                : 'bg-primary-600 hover:bg-primary-700 text-white'
                                                        }`}
                                                    >
                                                        <Icon 
                                                            icon={isSelected ? "heroicons:check-circle" : "heroicons:plus"} 
                                                            className="w-4 h-4" 
                                                        />
                                                        {isSelected ? 'Selected' : 'Add to Bid'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Icon icon="heroicons:cube" className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg">No parts available for this job</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .parts-swiper .swiper-button-next,
                .parts-swiper .swiper-button-prev {
                    color: #3b82f6;
                    background: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .parts-swiper .swiper-button-next:after,
                .parts-swiper .swiper-button-prev:after {
                    font-size: 16px;
                    font-weight: bold;
                }

                .parts-swiper .swiper-pagination-bullet {
                    background: #3b82f6;
                    opacity: 0.3;
                }

                .parts-swiper .swiper-pagination-bullet-active {
                    opacity: 1;
                }

                .parts-swiper {
                    padding: 16px 40px 40px;
                }
            `}</style>
        </div>
    );
}

export default PartModal;