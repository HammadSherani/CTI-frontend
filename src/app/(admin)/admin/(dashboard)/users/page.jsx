"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

function AdminUserPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasNext: false,
        hasPrev: false
    });
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm, filterStatus, filterRole]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(searchTerm && { search: searchTerm }),
                ...(filterStatus !== 'all' && { isActive: filterStatus === 'active' ? 'true' : 'false' }),
                ...(filterRole !== 'all' && { role: filterRole })
            });

            const response = await axiosInstance.get(`/admin/users?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setUsers(response.data.data.users || []);
            setPagination(response.data.data.pagination || {});
        } catch (error) {
            console.error('Error fetching users:', error);
            setSubmitError('Failed to load users');
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (userId) => {
        try {
            const user = users.find(u => u._id === userId);
            const res = await axiosInstance.put(`/admin/users/${userId}`, 
                { isActive: !user.isActive },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            toast.success(res.data.message || 'User status updated successfully');
            setSubmitSuccess(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully!`);
            setTimeout(() => setSubmitSuccess(''), 3000);
            fetchUsers();
        } catch (error) {
            console.error('Toggle active error:', error);
            setSubmitError('Failed to update user status. Please try again.');
            toast.error('Failed to update user status');
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
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

        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
        );

        // Page numbers
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

        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        );

        return (
            <div className="flex items-center justify-between mt-6 px-8 py-2">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                    <span className="font-medium">
                        {Math.min(currentPage * 10, pagination.totalUsers)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.totalUsers}</span> results
                </div>
                <div className="flex">{pages}</div>
            </div>
        );
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'approved': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'rejected': 'bg-red-100 text-red-800',
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const getRoleBadge = (role) => {
        const roleColors = {
            'admin': 'bg-purple-100 text-purple-800',
            'customer': 'bg-blue-100 text-blue-800',
            'vendor': 'bg-orange-100 text-orange-800',
        };
        return roleColors[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-600 mt-1">Manage all registered users</p>
                        </div>
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
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email or phone..."
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
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>

                        {/* Role Filter */}
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:account-group" className="text-gray-400 w-5 h-5" />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Roles</option>
                                <option value="customer">Customer</option>
                                <option value="vendor">Vendor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Loading users...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Verification
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Active
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                            <span className="text-primary-600 font-medium text-sm">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-xs text-gray-500">ID: {user._id.slice(-8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{user.email}</div>
                                                    <div className="text-sm text-gray-500">{user.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                                                        <Icon icon="mdi:shield-account" className="w-3 h-3 mr-1" />
                                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center text-xs">
                                                            <Icon 
                                                                icon={user.isEmailVerified ? "mdi:email-check" : "mdi:email-remove"} 
                                                                className={`w-4 h-4 mr-1 ${user.isEmailVerified ? 'text-green-600' : 'text-gray-400'}`}
                                                            />
                                                            <span className={user.isEmailVerified ? 'text-green-700' : 'text-gray-500'}>
                                                                Email
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-xs">
                                                            <Icon 
                                                                icon={user.isProfileComplete ? "mdi:account-check" : "mdi:account-remove"} 
                                                                className={`w-4 h-4 mr-1 ${user.isProfileComplete ? 'text-green-600' : 'text-gray-400'}`}
                                                            />
                                                            <span className={user.isProfileComplete ? 'text-green-700' : 'text-gray-500'}>
                                                                Profile
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => toggleActive(user._id)}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            user.isActive
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        } transition-colors`}
                                                    >
                                                        <Icon
                                                            icon={user.isActive ? 'mdi:eye' : 'mdi:eye-off'}
                                                            className="w-3 h-3 mr-1"
                                                        />
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Link 
                                                            href={`/admin/users/${user._id}`}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                            title="View user details"
                                                        >
                                                            <Icon icon="mdi:eye" className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => toggleActive(user._id)}
                                                            className={`transition-colors ${
                                                                user.isActive 
                                                                    ? 'text-red-600 hover:text-red-900' 
                                                                    : 'text-green-600 hover:text-green-900'
                                                            }`}
                                                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                                                        >
                                                            <Icon 
                                                                icon={user.isActive ? "mdi:toggle-switch" : "mdi:toggle-switch-off"} 
                                                                className="w-5 h-5" 
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && users.length === 0 && (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:account-group" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                                        <p className="text-gray-500">
                                            {searchTerm || filterStatus !== 'all' || filterRole !== 'all'
                                                ? 'Try adjusting your search or filters.'
                                                : 'No users are registered yet.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {!loading && renderPagination()}
                        </>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:account-group" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Users</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : pagination.totalUsers}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:eye" className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Active Users</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : users.filter(user => user.isActive).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:email-check" className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Verified Users</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : users.filter(user => user.isEmailVerified).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:account-multiple" className="w-8 h-8 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Customers</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : users.filter(user => user.role === 'customer').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminUserPage;