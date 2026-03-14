// components/repairman/FieldCorrections.jsx
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

export default function FieldCorrections() {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [corrections, setCorrections] = useState({});
const {token} = useSelector(state => state.auth);
  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/repairman/field-reviews', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      setReviews(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewDetails = async (reviewId) => {
    try {
      const response = await axiosInstance.get(`/repairman/field-reviews/${reviewId}`, {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      setSelectedReview(response.data.data);
      
      // Initialize corrections with current values
      const initialCorrections = {};
      response.data.data.fields.forEach(field => {
        initialCorrections[field.fieldName] = field.currentValue || '';
      });
      setCorrections(initialCorrections);
    } catch (error) {
      toast.error('Failed to fetch review details');
    }
  };

  const handleCorrectionChange = (fieldName, value) => {
    setCorrections(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmitCorrections = async () => {
    if (!selectedReview) return;

    // Prepare corrected fields
    const correctedFields = selectedReview.fields.map(field => ({
      fieldName: field.fieldName,
      correctedValue: corrections[field.fieldName]
    }));

    setSubmitting(true);
    try {
      await axiosInstance.post(
        `/repairman/field-reviews/${selectedReview.reviewId}/correct`,
        { correctedFields },
        {
          headers: {
            'Authorization': 'Bearer ' + token,
          }
        }
      );
      
      toast.success('Corrections submitted successfully');
      
      // Refresh data
      await fetchPendingReviews();
      setSelectedReview(null);
      setCorrections({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit corrections');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAll = async (reviewId) => {
    try {
      setSubmitting(true);
      await axiosInstance.post(`/repairman/field-reviews/${reviewId}/submit`, {}, {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      toast.success('All corrections submitted for admin review');
      await fetchPendingReviews();
      setSelectedReview(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Field Corrections Required</h1>

      {!selectedReview ? (
        // List of pending reviews
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Icon icon="mdi:check-circle" className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Pending Corrections</h3>
              <p className="text-gray-500">All your fields are up to date!</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.reviewId} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Review from {new Date(review.createdAt).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{review.overallComment}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {review.status}
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Fields to correct:</h4>
                  <ul className="space-y-2">
                    {review.fields.map(field => (
                      <li key={field.fieldName} className="flex items-start gap-2 text-sm">
                        <Icon icon="mdi:alert-circle" className="w-4 h-4 text-orange-500 mt-0.5" />
                        <div>
                          <span className="font-medium">{field.fieldName}:</span>
                          <span className="text-gray-600 ml-2">{field.issue}</span>
                          {field.status === 'resolved' && (
                            <span className="ml-2 text-green-600 text-xs">(Resolved ✓)</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => fetchReviewDetails(review.reviewId)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Correct Fields
                  </button>
                  
                  {review.fields.every(f => f.status === 'resolved') && (
                    <button
                      onClick={() => handleSubmitAll(review.reviewId)}
                      disabled={submitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                    >
                      Submit for Review
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Correction form for selected review
        <div className="bg-white rounded-lg shadow p-6">
          <button
            onClick={() => setSelectedReview(null)}
            className="mb-4 text-primary-600 hover:text-primary-800 flex items-center gap-1"
          >
            <Icon icon="mdi:arrow-left" className="w-4 h-4" />
            Back to list
          </button>

          <h2 className="text-xl font-bold mb-2">Correct Fields</h2>
          <p className="text-gray-600 mb-6">{selectedReview.overallComment}</p>

          <div className="space-y-6">
            {selectedReview.fields.map(field => (
              <div key={field.fieldName} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:alert" className="w-5 h-5 text-orange-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{field.fieldName}</h3>
                    <p className="text-sm text-gray-600 mb-3">Issue: {field.issue}</p>
                    
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500">Current Value:</span>
                      <p className="font-medium">{field.currentValue || 'Not provided'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Corrected Value <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={corrections[field.fieldName] || ''}
                        onChange={(e) => handleCorrectionChange(field.fieldName, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder={`Enter correct ${field.fieldName}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={() => setSelectedReview(null)}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitCorrections}
              disabled={submitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Corrections'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}