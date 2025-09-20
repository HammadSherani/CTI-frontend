"use client"

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import LoginModal from '../../mobile-repair/[brandSlug]/[modelId]/[color]/create-job/LoginModal';
import { useChat } from '@/hooks/useChat';

function RepairmanDetail() {
    const [repairman, setRepairman] = useState(null);
    const [loading, setLoading] = useState(true);
    // const [activeTab, setActiveTab] = useState('overview');
    const [isOpen, setIsOpen] = useState(false);
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const dispatch = useDispatch()

    const { user, token } = useSelector((state) => state.auth);


    const { selectChat, openChat } = useChat();

    const getRepairman = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/public/repairmans/${id}`);
            setRepairman(data.data.repairman);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (id) {
            getRepairman();
        }
    }, [id])

    // const handleCall = (phoneNumber) => {
    //     window.open(`tel:${phoneNumber}`, '_self')
    // }

    const handleWhatsApp = (whatsappNumber) => {
        const formattedNumber = whatsappNumber.replace(/^0/, '92')
        window.open(`https://wa.me/${formattedNumber}`, '_blank')
    }



    const handleMessageSend = async (id) => {
        if (!user && !token) {
            setIsOpen(true);
            return;
        }

        try {
            const { data } = await axiosInstance.post(
                `/chat/start`,
                { repairmanId: id },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );

            // Chat box kholna
            openChat();

            // Us chat ko select karna
            selectChat(data.chat._id);

            // router.push(`/hire-repairman/${id}/chat/${data.chat._id}`);
        } catch (error) {
            handleError(error);
        }
    };


    const handleHire = () => {
        alert(`Hiring ${repairman.repairmanProfile.fullName}...`)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading repairman details...</p>
                </div>
            </div>
        )
    }

    if (!repairman) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="mdi:account-alert" className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Repairman Not Found</h3>
                    <p className="text-gray-600 mb-4">The repairman you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    const profile = repairman.repairmanProfile;

    return (

        <>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                {/* <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => router.back()}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">RepairHub</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="text-gray-600 hover:text-gray-900">
                                <Icon icon="mdi:heart-outline" className="w-6 h-6" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                                <Icon icon="mdi:share-variant" className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div> */}

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2">
                            <div className=" rounded-lg  p-6 mb-6">
                                <div className="flex items-start space-x-6">
                                    <img
                                        src={profile.profilePhoto}
                                        alt={profile.fullName}
                                        className="w-32 h-32 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/150x150?text=No+Image'
                                        }}
                                    />
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            {profile.fullName}
                                        </h1>
                                        {/* <p className="text-lg text-gray-600 mb-3">
                                        profile.description
                                    </p> */}
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                            <div className="flex items-center">
                                                <Icon icon="mdi:map-marker" className="w-4 h-4 mr-1" />
                                                {profile?.city}
                                            </div>
                                            {/* <div className="flex items-center">
                                            <Icon icon="mdi:translate" className="w-4 h-4 mr-1" />
                                            English, Urdu, Hindi
                                        </div> */}
                                        </div>
                                        <div className="flex items-center space-x-6">
                                            <div className="flex items-center">
                                                <div className="flex text-yellow-400 mr-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Icon key={i} icon="mdi:star" className="w-4 h-4" />
                                                    ))}
                                                </div>
                                                <span className="font-semibold text-gray-900">{profile.rating}</span>
                                                <span className="text-gray-500 ml-1">({profile.totalJobs})</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="text-right">
                                    <div className="flex items-center mb-2">
                                        <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                                        <span className="text-sm text-gray-600">Online</span>
                                    </div>
                                    <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                        Contact me
                                    </button>
                                </div> */}
                                </div>
                            </div>

                            {/* About Section */}
                            <div className="bg-white rounded-lg  p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">About me</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {profile.description}
                                </p>
                                <button className="text-green-600 hover:text-green-700 font-medium">
                                    Read more
                                </button>
                            </div>

                            {/* Skills Section */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                                <div className="flex flex-wrap gap-3">
                                    {profile.specializations.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {/* <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Social media marketer</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Video editor</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Motion graphics designer</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Software developer</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Instagram post designer</span> */}
                                </div>
                            </div>

                            {/* Services Section */}
                            {/* <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Services</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <img 
                                            src="https://via.placeholder.com/120x80?text=Service+1" 
                                            alt="Service"
                                            className="w-20 h-16 object-cover rounded"
                                        />
                                        <button className="text-gray-400 hover:text-red-500">
                                            <Icon icon="mdi:heart-outline" className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        I will edit your youtube videos
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-yellow-400">
                                            <Icon icon="mdi:star" className="w-4 h-4" />
                                            <span className="text-gray-900 ml-1 text-sm">5.0 (3)</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">From $30</span>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <img 
                                            src="https://via.placeholder.com/120x80?text=Service+2" 
                                            alt="Service"
                                            className="w-20 h-16 object-cover rounded"
                                        />
                                        <button className="text-gray-400 hover:text-red-500">
                                            <Icon icon="mdi:heart-outline" className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        I will design a modern, fancy, and minimalist logo
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-yellow-400">
                                            <Icon icon="mdi:star" className="w-4 h-4" />
                                            <span className="text-gray-900 ml-1 text-sm">5.0 (2)</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">From $50</span>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <img 
                                            src="https://via.placeholder.com/120x80?text=Service+3" 
                                            alt="Service"
                                            className="w-20 h-16 object-cover rounded"
                                        />
                                        <button className="text-gray-400 hover:text-red-500">
                                            <Icon icon="mdi:heart-outline" className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        I will develop high quality ios and android mobile apps
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-yellow-400">
                                            <Icon icon="mdi:star" className="w-4 h-4" />
                                            <span className="text-gray-900 ml-1 text-sm">5.0 (1)</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">From $300</span>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <img 
                                            src="https://via.placeholder.com/120x80?text=Service+4" 
                                            alt="Service"
                                            className="w-20 h-16 object-cover rounded"
                                        />
                                        <button className="text-gray-400 hover:text-red-500">
                                            <Icon icon="mdi:heart-outline" className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        I will design a modern responsive website
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-yellow-400">
                                            <Icon icon="mdi:star" className="w-4 h-4" />
                                            <span className="text-gray-900 ml-1 text-sm">5.0</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">From $100</span>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                            {/* Portfolio Section */}
                            {/* <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio</h2>
                            <div className="border rounded-lg overflow-hidden">
                                <img 
                                    src="https://via.placeholder.com/600x400?text=Portfolio+Project" 
                                    alt="Portfolio"
                                    className="w-full h-64 object-cover"
                                />
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-sm text-gray-500">From: April 2020</span>
                                            <h3 className="text-lg font-semibold text-gray-900">Magnet Hub Website</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">+62</div>
                                            <div className="text-sm text-gray-500">Projects</div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Project Overview Client Goal: The client sought to develop a versatile business platform aimed at connecting businesses, facilitating networking, and streamlining business operations. The platform was intended to serve...
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Business Services & Consulting</span>
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Website Design</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Project cost: $400-$600</span>
                                        <span>Project duration: 1-3 months</span>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                            {/* Reviews Section */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">6 Reviews</h2>
                                    <div className="flex items-center">
                                        <div className="flex text-yellow-400 mr-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Icon key={i} icon="mdi:star" className="w-4 h-4" />
                                            ))}
                                        </div>
                                        <span className="font-semibold text-gray-900">5.0</span>
                                    </div>
                                </div>

                                {/* Rating Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-600 w-12">5 Stars</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                                                    <div className="bg-gray-800 h-2 rounded-full" style={{ width: '100%' }}></div>
                                                </div>
                                                <span className="text-sm text-gray-600">(6)</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-600 w-12">4 Stars</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                                                    <div className="bg-gray-800 h-2 rounded-full" style={{ width: '0%' }}></div>
                                                </div>
                                                <span className="text-sm text-gray-600">(0)</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-600 w-12">3 Stars</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                                                    <div className="bg-gray-800 h-2 rounded-full" style={{ width: '0%' }}></div>
                                                </div>
                                                <span className="text-sm text-gray-600">(0)</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-600 w-12">2 Stars</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                                                    <div className="bg-gray-800 h-2 rounded-full" style={{ width: '0%' }}></div>
                                                </div>
                                                <span className="text-sm text-gray-600">(0)</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-600 w-12">1 Star</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                                                    <div className="bg-gray-800 h-2 rounded-full" style={{ width: '0%' }}></div>
                                                </div>
                                                <span className="text-sm text-gray-600">(0)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Rating Breakdown</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Seller communication level</span>
                                                <div className="flex items-center">
                                                    <Icon icon="mdi:star" className="w-4 h-4 text-yellow-400" />
                                                    <span className="text-sm ml-1">5</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Quality of delivery</span>
                                                <div className="flex items-center">
                                                    <Icon icon="mdi:star" className="w-4 h-4 text-yellow-400" />
                                                    <span className="text-sm ml-1">5</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Value of delivery</span>
                                                <div className="flex items-center">
                                                    <Icon icon="mdi:star" className="w-4 h-4 text-yellow-400" />
                                                    <span className="text-sm ml-1">5</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Individual Reviews */}
                                <div className="space-y-6">
                                    <div className="border-b pb-6">
                                        <div className="flex items-start space-x-3">
                                            <img
                                                src="https://via.placeholder.com/40x40?text=U"
                                                alt="User"
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium text-gray-900">shafimshroff</span>
                                                    <img
                                                        src="https://via.placeholder.com/16x12?text=IN"
                                                        alt="India"
                                                        className="w-4 h-3"
                                                    />
                                                </div>
                                                <div className="flex items-center mb-2">
                                                    <div className="flex text-yellow-400 mr-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Icon key={i} icon="mdi:star" className="w-4 h-4" />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-gray-500">9 months ago</span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    I wanted to take a moment to express my sincere appreciation for the opportunity to work with your team. It has been an absolute pleasure collaborating with such a talented and dedicated group of professionals. I highly recommend your team's services, as the quality of their work and deliverables have...
                                                    <button className="text-green-600 hover:text-green-700 ml-1">See more</button>
                                                </p>
                                                <div className="flex items-center mt-3">
                                                    <span className="text-sm text-gray-500 mr-4">$600-$800 • 2 months Duration</span>
                                                    <img
                                                        src="https://via.placeholder.com/60x40?text=Project"
                                                        alt="Project"
                                                        className="w-15 h-10 rounded"
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                                    <span>Helpful?</span>
                                                    <button className="flex items-center hover:text-gray-700">
                                                        <Icon icon="mdi:thumb-up-outline" className="w-4 h-4 mr-1" />
                                                        Yes
                                                    </button>
                                                    <button className="flex items-center hover:text-gray-700">
                                                        <Icon icon="mdi:thumb-down-outline" className="w-4 h-4 mr-1" />
                                                        No
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-b pb-6">
                                        <div className="flex items-start space-x-3">
                                            <img
                                                src="https://via.placeholder.com/40x40?text=J"
                                                alt="User"
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium text-gray-900">jakemydawg</span>
                                                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Repeat Client</span>
                                                    <img
                                                        src="https://via.placeholder.com/16x12?text=US"
                                                        alt="United States"
                                                        className="w-4 h-3"
                                                    />
                                                </div>
                                                <div className="flex items-center mb-2">
                                                    <div className="flex text-yellow-400 mr-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Icon key={i} icon="mdi:star" className="w-4 h-4" />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-gray-500">4 years ago</span>
                                                </div>
                                                <p className="text-gray-700 text-sm">Amazing videos!</p>
                                                <div className="flex items-center mt-3">
                                                    <img
                                                        src="https://via.placeholder.com/60x40?text=Video"
                                                        alt="Video"
                                                        className="w-15 h-10 rounded"
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                                    <span>Helpful?</span>
                                                    <button className="flex items-center hover:text-gray-700">
                                                        <Icon icon="mdi:thumb-up-outline" className="w-4 h-4 mr-1" />
                                                        Yes
                                                    </button>
                                                    <button className="flex items-center hover:text-gray-700">
                                                        <Icon icon="mdi:thumb-down-outline" className="w-4 h-4 mr-1" />
                                                        No
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button className="mt-6 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    Show More Reviews
                                </button>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* Contact Card */}
                            <div className="bg-white rounded-lg shadow-sm p-6 ">
                                <div className="flex items-center space-x-3 mb-4">
                                    <img
                                        src={profile.profilePhoto}
                                        alt={profile.fullName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{profile.fullName}</h3>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                            <span className="text-sm text-gray-600">Offline • 02:04 AM local time</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* <button 
                                    onClick={() => handleCall(profile.mobileNumber)}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                                >
                                    <Icon icon="mdi:phone" className="w-5 h-5 mr-2" />
                                    Call Now
                                </button> */}

                                    <button
                                        onClick={() => handleWhatsApp(profile.whatsappNumber)}
                                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                                    >
                                        <Icon icon="mdi:whatsapp" className="w-5 h-5 mr-2" />
                                        WhatsApp
                                    </button>

                                    <button
                                        onClick={() => handleMessageSend(repairman._id)}
                                        className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                                    >
                                        <Icon icon="mdi:email" className="w-5 h-5 mr-2" />
                                        Send Message
                                    </button>

                                    {/* <button 
                                    onClick={handleHire}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                                >
                                    <Icon icon="mdi:account-plus" className="w-5 h-5 mr-2" />
                                    Hire Now
                                </button> */}
                                </div>
                            </div>

                            {/* Shop Information */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Shop Information</h3>

                                {profile.shopPhoto && (
                                    <div className="mb-4">
                                        <img
                                            src={profile.shopPhoto}
                                            alt={profile.shopName}
                                            className="w-full h-32 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x150?text=No+Shop+Image'
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <Icon icon="mdi:store" className="w-4 h-4 text-gray-500 mr-2 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900">{profile.shopName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Icon icon="mdi:map-marker" className="w-4 h-4 text-gray-500 mr-2 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-700">{profile.fullAddress}</p>
                                            <p className="text-xs text-gray-500">{profile.city}, {profile.district} - {profile.zipCode}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <Icon icon="mdi:clock" className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-sm text-gray-700">
                                            {profile.workingHours.start} - {profile.workingHours.end}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <Icon icon="mdi:calendar" className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-sm text-gray-700">
                                            {profile.workingDays.join(', ')}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <Icon icon="mdi:truck" className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className={`text-sm ${profile.pickupService ? 'text-green-600' : 'text-red-600'}`}>
                                            Pickup Service: {profile.pickupService ? 'Available' : 'Not Available'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Contact Details</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Icon icon="mdi:phone" className="w-4 h-4 text-gray-500 mr-3" />
                                        <span className="text-sm text-gray-700">{profile.mobileNumber}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Icon icon="mdi:whatsapp" className="w-4 h-4 text-gray-500 mr-3" />
                                        <span className="text-sm text-gray-700">{profile.whatsappNumber}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Icon icon="mdi:email" className="w-4 h-4 text-gray-500 mr-3" />
                                        <span className="text-sm text-gray-700">{profile.emailAddress}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            {/* <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <Icon icon="mdi:account" className="w-4 h-4 text-gray-500 mr-3" />
                                    <span className="text-sm text-gray-700">{profile.emergencyContactPerson}</span>
                                </div>
                                <div className="flex items-center">
                                    <Icon icon="mdi:phone-alert" className="w-4 h-4 text-gray-500 mr-3" />
                                    <span className="text-sm text-gray-700">{profile.emergencyContactNumber}</span>
                                </div>
                            </div>
                        </div> */}

                            {/* Account Status */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Email Verified</span>
                                        <div className="flex items-center">
                                            <Icon
                                                icon={repairman.isEmailVerified ? "mdi:check-circle" : "mdi:close-circle"}
                                                className={`w-4 h-4 ${repairman.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Profile Complete</span>
                                        <div className="flex items-center">
                                            <Icon
                                                icon={repairman.isProfileComplete ? "mdi:check-circle" : "mdi:close-circle"}
                                                className={`w-4 h-4 ${repairman.isProfileComplete ? 'text-green-600' : 'text-red-600'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Documents</span>
                                        <div className="flex items-center">
                                            <Icon
                                                icon={repairman.isDocumentComplete ? "mdi:check-circle" : "mdi:close-circle"}
                                                className={`w-4 h-4 ${repairman.isDocumentComplete ? 'text-green-600' : 'text-red-600'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Member Since</span>
                                            <span className="text-sm text-gray-900 font-medium">{formatDate(repairman.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{profile.totalJobs}</div>
                                        <div className="text-sm text-gray-600">Total Jobs</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{profile.rating}/5</div>
                                        <div className="text-sm text-gray-600">Average Rating</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{profile.yearsOfExperience || 'N/A'}</div>
                                        <div className="text-sm text-gray-600">Years Experience</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message Box */}
                    <div className="fixed bottom-8 right-8">
                        <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-colors">
                            <Icon icon="mdi:message" className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>


            <LoginModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            // onSuccess={}


            />
        </>
    )

}


export default RepairmanDetail