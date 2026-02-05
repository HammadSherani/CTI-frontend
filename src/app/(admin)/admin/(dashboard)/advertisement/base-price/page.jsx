"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

// Validation schema
const basePriceSchema = yup.object().shape({
  price: yup
    .number()
    .typeError('Price must be a number')
    .required('Price is required')
    .positive('Price must be greater than zero'),
  currency: yup.string().required('Currency is required'),
  note: yup.string().nullable(),
});

function AdvertisementBasePrice() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  
  // Static sample data (will be replaced with API data)
  const [basePrices, setBasePrices] = useState([
    { _id: '1', price: 1.0, currency: 'USD'},
  ]);
  
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [deletingIds, setDeletingIds] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(basePriceSchema),
    defaultValues: {
      price: '',
      currency: 'USD',
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');
      const payload = {
        basePrice: Number(data.price),
        currency: data.currency,
      };

      if (editingId) {
        // Update existing price
        const res = await axiosInstance.put(
          `/admin/advertisements/update-base/${editingId}`, 
          payload, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmitSuccess('Base price updated successfully!');
        
        // Update local list
        setBasePrices(prev => prev.map(p => 
          p._id === editingId ? { ...p, ...payload } : p
        ));
        setEditingId(null);
      } else {
        // Create new price
        const res = await axiosInstance.post(
          '/admin/advertisements/create-base', 
          payload, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(res.data.message || 'Base price created successfully!');
        setSubmitSuccess('Base price created successfully!');
        
        // Add to local list (use API response or create temp ID)
        const created = res.data?.data || { 
          _id: Date.now().toString(), 
          ...payload 
        };
        setBasePrices(prev => [created, ...prev]);
      }

      reset();
      setShowForm(false);
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving base price:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to save base price. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    reset();
    setSubmitError('');
    setSubmitSuccess('');
    setEditingId(null);
    setShowForm(false);
  };

  // Fetch base prices from API (currently using static data)
  useEffect(() => {
    const fetchPrices = async () => {
      setLoadingPrices(true);
      try {
        const res = await axiosInstance.get('/admin/advertisements/fetch/base', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data?.data || res.data || [];
        setBasePrices(data);
      } catch (err) {
        console.error('Failed to fetch base prices, using static data:', err);
        // Keep static fallback data
      } finally {
        setLoadingPrices(false);
      }
    };
    fetchPrices(); // Uncomment when API is ready
  }, [token]);

  const handleEdit = (item) => {
    setEditingId(item._id);
    setValue('price', item.basePrice);
    setValue('currency', item.currency || 'USD');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this base price?')) return;
    
    // Optimistic UI update
    const originalPrices = basePrices.slice();
    setDeletingIds(prev => ({ ...prev, [id]: true }));
    setBasePrices(prev => prev.filter(p => p._id !== id));
    
    try {
      await axiosInstance.delete(`/admin/advertisements/delete-base/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Base price deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      // Restore on failure
      setBasePrices(originalPrices);
      toast.error('Failed to delete base price');
    } finally {
      setDeletingIds(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: '$',
      EUR: '€',
      PKR: '₨',
      GBP: '£',
      JPY: '¥',
    };
    return symbols[currency] || currency;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advertisement Base Prices</h1>
              <p className="text-gray-600 mt-1">Manage base pricing for advertisements</p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) handleCancel();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Icon icon={showForm ? "mdi:close" : "mdi:plus"} className="w-5 h-5" />
              {showForm ? 'Cancel' : 'Add New Price'}
            </button>
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

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Base Price' : 'Create New Base Price'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price')}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter price amount"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Currency *
                  </label>
                  <select
                    id="currency"
                    {...register('currency')}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.currency ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="PKR">PKR - Pakistani Rupee</option>
                  </select>
                  {errors.currency && (
                    <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
                  )}
                </div>

                
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update Price' : 'Create Price'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Prices List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Base Prices</h2>
            <p className="text-sm text-gray-600 mt-1">
              {basePrices.length} {basePrices.length === 1 ? 'price' : 'prices'} configured
            </p>
          </div>

          {loadingPrices ? (
            <div className="p-12 text-center">
              <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading prices...</p>
            </div>
          ) : basePrices.length === 0 ? (
            <div className="p-12 text-center">
              <Icon icon="mdi:currency-usd-off" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No base prices configured</p>
              <p className="text-gray-500 text-sm mb-4">Get started by adding your first base price</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Icon icon="mdi:plus" className="w-5 h-5" />
                Add First Price
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Currency
                    </th>
                   
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {basePrices.map((item) => (
                    <tr 
                      key={item._id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        deletingIds[item._id] ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-gray-900">
                            {getCurrencySymbol(item.currency)}
                            {item.basePrice}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {item.currency}
                        </span>
                      </td>
                    
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={deletingIds[item._id]}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit price"
                          >
                            <Icon icon="mdi:pencil" className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingIds[item._id]}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete price"
                          >
                            {deletingIds[item._id] ? (
                              <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                            ) : (
                              <Icon icon="mdi:delete" className="w-4 h-4" />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon icon="mdi:information" className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">About Base Prices</h3>
              <p className="text-sm text-blue-800">
                Base prices are used as the foundation for calculating advertisement costs. 
                You can configure multiple prices in different currencies to support international markets.
              
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvertisementBasePrice;