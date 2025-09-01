"use client";

import Loader from '@/components/Loader';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

function Page() {
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
            setError('Failed to load brands. Please try again later.');
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    return (
        <Loader loading={loading} >
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h4 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8">
                        Discover Top Brands
                    </h4>

                    {/* {loading && (
                    <div className="flex justify-center items-center min-h-[200px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                )} */}

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
                            <p>{error}</p>
                            <button
                                onClick={fetchBrands}
                                className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && brands.length === 0 && (
                        <p className="text-center text-gray-600">No brands available at the moment.</p>
                    )}

                    {!loading && !error && brands.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {brands.map((brand) => (
                                <div
                                    key={brand.id}
                                    className="group bg-white rounded-lg shadow-md  transition-all duration-300 p-4 flex flex-col items-center justify-center transform "
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && console.log(`Clicked ${brand.name}`)}
                                >
                                    <div className="relative w-24 h-24 md:w-32 md:h-32">
                                        <Image
                                            src={brand?.icon || '/fallback-brand.png'}
                                            alt={brand?.name || 'Brand'}
                                            fill
                                            sizes="(max-width: 768px) 100px, 150px"
                                            className="object-contain transition-transform duration-300 "
                                            priority={false}
                                            onError={(e) => (e.target.src = '/fallback-brand.png')}
                                            aria-label={`Logo of ${brand?.name || 'brand'}`}
                                        />
                                    </div>
                                    <h5 className="mt-4 text-lg md:text-xl font-semibold text-gray-700 capitalize text-center">
                                        <Link href={`/mobile-repair/${brand?.slug}`}>
                                            {brand?.name}
                                        </Link>
                                    </h5>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Loader>
    );
}

export default Page;
