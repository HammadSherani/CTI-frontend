import React, { useState } from 'react';
import { Icon } from '@iconify/react'; 
const UpSellModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    revisionPrice: '',
    reason: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Icon icon="mdi:alert-circle-outline" className="mr-2 text-blue-600 w-5 h-5" />
            Revised Quotation
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Total Price (Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-medium">Rs.</span>
              <input
                type="number"
                required
                placeholder="e.g. 4000"
                className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.revisionPrice}
                onChange={(e) => setFormData({...formData, revisionPrice: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Price Update
            </label>
            <textarea
              required
              rows="3"
              placeholder="Explain the additional fault found (e.g., IC Short, Screen Damage)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          <p className="text-xs text-gray-500 italic">
            * Note: Customer will receive a notification to approve or reject this new price.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <Icon icon="mdi:loading" className="animate-spin w-5 h-5" />
              ) : (
                'Send Revision'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpSellModal;