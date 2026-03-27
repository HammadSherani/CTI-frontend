"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

function AdminBlogListing() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchBlogs();
    }, [currentPage, searchTerm, filterActive, filterStatus]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(searchTerm && { search: searchTerm }),
                ...(filterActive !== 'all' && { isActive: filterActive === 'active' ? 'true' : 'false' }),
                ...(filterStatus !== 'all' && { status: filterStatus })
            });

            const response = await axiosInstance.get(`/admin/blogs?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setBlogs(response.data.data || []);
            setPagination(response.data.pagination || {});
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setSubmitError('Failed to load blogs');
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (blogId) => {
        if (window.confirm('Are you sure you want to delete this blog?')) {
            try {
                const res = await axiosInstance.delete(`/admin/blogs/${blogId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast.success(res.data.message);
                setSubmitSuccess('Blog deleted successfully!');
                setTimeout(() => setSubmitSuccess(''), 3000);
                fetchBlogs();
            } catch (error) {
                console.error('Delete error:', error);
                setSubmitError('Failed to delete blog. Please try again.');
                toast.error('Failed to delete blog');
            }
        }
    };

    const toggleActive = async (blogId) => {
        try {
            const res = await axiosInstance.patch(`/admin/blogs/${blogId}/toggle-status`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            toast.success(res.data.message);
            fetchBlogs();
        } catch (error) {
            console.error('Toggle active error:', error);
            setSubmitError('Failed to update blog status. Please try again.');
            toast.error('Failed to update blog status');
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
        );

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-300 hover:bg-gray-50 ${
                        currentPage === i
                            ? 'bg-primary-50 text-primary-600 border-primary-500'
                            : 'bg-white text-gray-500'
                    }`}
                >
                    {i}
                </button>
            );
        }

        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        );

        return (
            <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * pagination.itemsPerPage) + 1}</span> to{' '}
                    <span className="font-medium">
                        {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.totalItems}</span> results
                </div>
                <div className="flex">{pages}</div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                            <p className="text-gray-600 mt-1">Manage blog posts and articles</p>
                        </div>
                        <Link
                            href="/admin/blogs/create"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5" />
                            Add Blog
                        </Link>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {submitSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 mr-2" />
                            <p className="text-green-800">{submitSuccess}</p>
                        </div>
                    </div>
                )}

                {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-800">{submitError}</p>
                        </div>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search blogs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:filter" className="text-gray-400 w-5 h-5" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Active Filter */}
                        <div className="flex items-center gap-2">
                            <select
                                value={filterActive}
                                onChange={(e) => setFilterActive(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Blogs</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Blogs Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading blogs...</p>
                        </div>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Icon icon="mdi:post" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm || filterActive !== 'all' || filterStatus !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : 'Get started by creating your first blog post.'
                            }
                        </p>
                        {(!searchTerm && filterActive === 'all' && filterStatus === 'all') && (
                            <Link
                                href="/admin/blogs/create"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                            >
                                <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                                Create your first blog
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map((blog) => (
                                <div key={blog._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Featured Image */}
                                    <div className="relative h-48 bg-gray-200">
                                        {blog.featuredImage ? (
                                            <img 
                                                src={blog.featuredImage} 
                                                alt={blog.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <Icon icon="mdi:image-off" className="w-12 h-12 text-gray-400" />
                                            </div>
                                        )}
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(blog.status)}`}>
                                                {blog.status}
                                            </span>
                                        </div>

                                        {/* Active/Inactive Badge */}
                                        <div className="absolute top-3 right-3">
                                            <button
                                                onClick={() => toggleActive(blog._id)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    blog.isActive
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                } transition-colors`}
                                            >
                                                <Icon
                                                    icon={blog.isActive ? 'mdi:eye' : 'mdi:eye-off'}
                                                    className="w-3 h-3 mr-1"
                                                />
                                                {blog.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4">
                                        {/* Title */}
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                            {blog.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {blog.description}
                                        </p>

                                        {/* Tags */}
                                        {blog.tags && blog.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {blog.tags.slice(0, 3).map((tag, index) => (
                                                    <span 
                                                        key={index}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                                {blog.tags.length > 3 && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                        +{blog.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Author & Date */}
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-3 border-t">
                                            <div className="flex items-center">
                                                <Icon icon="mdi:account" className="w-4 h-4 mr-1" />
                                                <span>{blog.author}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Icon icon="mdi:calendar" className="w-4 h-4 mr-1" />
                                                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Link 
                                                href={`/admin/blogs/${blog._id}/edit`}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                                            >
                                                <Icon icon="mdi:pencil" className="w-4 h-4" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(blog._id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <Icon icon="mdi:trash-can" className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {renderPagination()}
                    </>
                )}

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:post" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Blogs</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : pagination.totalItems}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:check-circle" className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Published</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : blogs.filter(b => b.status === 'published').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:file-edit" className="w-8 h-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Drafts</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : blogs.filter(b => b.status === 'draft').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:archive" className="w-8 h-8 text-gray-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Archived</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : blogs.filter(b => b.status === 'archived').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminBlogListing;