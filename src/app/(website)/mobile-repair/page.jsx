"use client";

import Loader from '@/components/Loader';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';


function BrandPage() {
    const router = useRouter();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await axiosInstance.get("/public/brands");
            setBrands(data?.data?.brands || []);
        } catch (error) {
            setError("Failed to load brands. Please try again.");
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (slug) => {
        router.push(`/mobile-repair/${slug}`);
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    return (
        <Loader loading={loading}>
            <div className='bg-white'>
                <div className='px-12 py-3'>

                <Breadcrumb />
                </div>
                <section className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 pb-14 pt-4 px-8 sm:px-8 lg:px-12">
                    <div className="">

                        {/* Page Title */}
                        <motion.h4
                            className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-12"
                           
                        >
                            Explore Top Mobile Brands
                        </motion.h4>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-400 text-red-700 p-4 rounded-md mb-6 text-center shadow-sm">
                                <p>{error}</p>
                                <button
                                    onClick={fetchBrands}
                                    className="mt-3 px-5 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && brands.length === 0 && (
                            <p className="text-center text-gray-500 text-lg tracking-wide">
                                No brands available at the moment.
                            </p>
                        )}

                        {/* Brands Grid */}
                        {!loading && !error && brands.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-7">
                                {brands.map((brand, index) => (
                                    <motion.div
                                        key={brand.id}
                                        className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-sm  transition-all p-5 flex flex-col items-center border border-gray-100 cursor-pointer"
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleCardClick(brand?.slug)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                handleCardClick(brand?.slug);
                                            }
                                        }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        {/* Brand Logo */}
                                        <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
                                            <Image
                                                src={brand?.icon || "/fallback-brand.png"}
                                                alt={brand?.name || "Brand"}
                                                fill
                                                className="object-contain transition-transform duration-300 group-hover:scale-110"
                                                sizes="150px"
                                                onError={(e) => (e.target.src = "/fallback-brand.png")}
                                            />
                                        </div>

                                        {/* Brand Name */}
                                        <h5 className="mt-4 text-lg font-semibold text-gray-700 capitalize text-center group-hover:text-orange-600 transition">
                                            {brand?.name}
                                        </h5>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>


        </Loader>
    );
}

export default BrandPage;
