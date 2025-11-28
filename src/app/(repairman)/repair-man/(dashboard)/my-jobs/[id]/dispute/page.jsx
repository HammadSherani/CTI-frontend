"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import DisputeDetails from './DisputeDetails';


function RepairmanDispute() {
    const [job, setJob] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dispute, setDispute] = useState(null)
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const { token } = useSelector((state) => state.auth);



    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/repairman/my-booking/${id}/detail`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            });
            if (data.success) {
                setJob(data.data || {});
                setDispute(data.data.dispute || null);
                setError(null);
            } else {
                setError('Failed to load job details');
            }
        } catch (error) {
            setError('Failed to load job details. Please try again.');
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobDetails();
    }, [id]);



    const formatCurrency = (amount, currency = 'TRY') => {
        return `${currency} ${amount?.toLocaleString() || 0}`;
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-primary-100 text-primary-800 border-primary-200';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'parts_needed': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'quality_check': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'delivered': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Job</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchJobDetails}
                        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const tracking = job.tracking || {};

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <button
                                onClick={() => router.back()}
                                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                            >
                                <Icon icon="heroicons:arrow-left" className="w-5 h-5 mr-2" />
                                Back to Jobs
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">Dispute Details</h1>
                            <p className="text-gray-600">Manage and respond to dispute</p>
                        </div>
                        {tracking.currentLocation && (
                            <div className={`px-4 py-2 rounded-full border ${getStatusColor(tracking.currentLocation)}`}>
                                <span className="font-semibold">
                                    {tracking.currentLocation?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Dispute Details Component */}
                    {dispute ? (
                        <DisputeDetails
                            dispute={dispute}
                            job={job}
                            fetchJobDetails={fetchJobDetails}
                        />
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <div className="text-center">
                                <Icon icon="heroicons:exclamation-circle" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Dispute Found</h3>
                                <p className="text-gray-600 mb-6">
                                    There is no active dispute for this job.
                                </p>
                                <button
                                    onClick={() => router.back()}
                                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                                >
                                    Go Back to Jobs
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default RepairmanDispute