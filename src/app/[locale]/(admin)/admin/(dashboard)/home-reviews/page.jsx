"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

export default function AdminHomeReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentReviewId, setCurrentReviewId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        type: 'general',
        username: '',
        reviewText: '',
        rating: 5,
        profilePhoto: '',
        image: ''
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/home-reviews');
            setReviews(res.data.data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (review = null) => {
        if (review) {
            setEditMode(true);
            setCurrentReviewId(review._id);
            setFormData({
                type: review.type || 'general',
                username: review.username || '',
                reviewText: review.reviewText || '',
                rating: review.rating || 5,
                profilePhoto: review.profilePhoto || '',
                image: review.image || ''
            });
        } else {
            setEditMode(false);
            setCurrentReviewId(null);
            setFormData({
                type: 'general',
                username: '',
                reviewText: '',
                rating: 5,
                profilePhoto: '',
                image: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axiosInstance.put(`/home-reviews/${currentReviewId}`, formData);
                toast.success('Review updated successfully!');
            } else {
                await axiosInstance.post('/home-reviews', formData);
                toast.success('Review added successfully!');
            }
            handleCloseModal();
            fetchReviews();
        } catch (error) {
            console.error('Error saving review:', error);
            toast.error(error.response?.data?.message || 'Failed to save review');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await axiosInstance.delete(`/home-reviews/${id}`);
                toast.success('Review deleted successfully!');
                fetchReviews();
            } catch (error) {
                console.error('Error deleting review:', error);
                toast.error('Failed to delete review');
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Home Page Reviews</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                    <Icon icon="mdi:plus" />
                    Add Review
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Type</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700">User</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Rating</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Review Text</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No reviews found</td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <span className="capitalize bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                {review.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            {review.profilePhoto ? (
                                                <img src={review.profilePhoto} alt={review.username} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <Icon icon="mdi:account" className="text-gray-500" />
                                                </div>
                                            )}
                                            <span className="font-medium text-gray-900">{review.username}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-amber-500">
                                                {review.rating} <Icon icon="mdi:star" className="ml-1" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 line-clamp-2 max-w-xs" title={review.reviewText}>
                                                {review.reviewText}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button
                                                onClick={() => handleOpenModal(review)}
                                                className="text-primary-600 hover:text-primary-800"
                                            >
                                                <Icon icon="mdi:pencil" width={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Icon icon="mdi:delete" width={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">{editMode ? 'Edit Review' : 'Add Review'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800">
                                <Icon icon="mdi:close" width={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="reviewForm" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500"
                                            required
                                        >
                                            <option value="general">General</option>
                                            <option value="repairman">Repairman</option>
                                            <option value="seller">Seller</option>
                                            <option value="buyer">Buyer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                                        <input
                                            type="number"
                                            name="rating"
                                            min="1"
                                            max="5"
                                            value={formData.rating}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo (URL) - Optional</label>
                                    <input
                                        type="text"
                                        name="profilePhoto"
                                        value={formData.profilePhoto}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Review Image (URL) - Optional</label>
                                    <input
                                        type="text"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
                                    <textarea
                                        name="reviewText"
                                        value={formData.reviewText}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500"
                                        required
                                    ></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="reviewForm"
                                className="px-5 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                            >
                                {editMode ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
