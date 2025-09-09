import axiosInstance from '@/config/axiosInstance';
import { Icon } from '@iconify/react';
import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import handleError from '@/helper/handleError';
import { toast } from 'react-toastify';

const MAX_REASON_LENGTH = 500;

// Memoized animation variants to prevent recreation on every render
const animationVariants = {
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },
  modal: {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    exit: {
      y: 50,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    }
  },
  button: {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2, ease: "easeOut" } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  }
};

function WithdrawModal({ isOpen, onClose, offerId, onWithdraw, loading = false }) {
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const token = useSelector(state => state.auth.token);

  console.log(token);
  

  // Memoize validation to prevent unnecessary recalculations
  const isFormValid = useMemo(() => {
    return reason.trim().length > 0 && reason.length <= MAX_REASON_LENGTH;
  }, [reason]);

  const handleReasonChange = useCallback((e) => {
    const value = e.target.value;
    
    // Prevent exceeding character limit
    if (value.length > MAX_REASON_LENGTH) return;
    
    setReason(value);
    
    // Clear errors when user starts typing
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: '' }));
    }
  }, [errors.reason]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason for withdrawal';
    } else if (reason.length > MAX_REASON_LENGTH) {
      newErrors.reason = `Reason must be less than ${MAX_REASON_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [reason]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const payload = { reason: reason.trim() };
      
      const response = await axiosInstance.delete(`/repairman/offers/${offerId}`, {
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(response.data.message)
      if (onWithdraw) {
        onWithdraw(offerId, payload, response);
      }
      
      handleClose();
      
    } catch (error) {
      handleError(error);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, isSubmitting, reason, offerId, token, onWithdraw]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    
    setReason('');
    setErrors({});
    onClose();
  }, [isSubmitting, onClose]);

  const characterCount = useMemo(() => {
    return `${reason.length}/${MAX_REASON_LENGTH} characters`;
  }, [reason.length]);

  if (!isOpen) return null;

  const isDisabled = loading || isSubmitting;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/10 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4"
        variants={animationVariants.backdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.target === e.currentTarget && handleClose()} 
      >
        <motion.div
          className="bg-white rounded-lg max-w-md w-full shadow-xl"
          variants={animationVariants.modal}
          onClick={(e) => e.stopPropagation()} 
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center">
              <motion.div
                className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Icon icon="heroicons:exclamation-triangle" className="w-6 h-6 text-red-600" />
              </motion.div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Withdraw Offer</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <motion.button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              disabled={isDisabled}
              variants={animationVariants.button}
              whileHover="hover"
              whileTap="tap"
              aria-label="Close modal"
            >
              <Icon icon="heroicons:x-mark" className="w-6 h-6" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="mb-6">
              <label 
                htmlFor="withdrawal-reason" 
                className="block text-sm font-medium text-gray-700 mb-3"
              >
                Reason for Withdrawal *
              </label>
              <motion.textarea
                id="withdrawal-reason"
                value={reason}
                onChange={handleReasonChange}
                rows="4"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors resize-none ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your reason for withdrawing this offer..."
                disabled={isDisabled}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                maxLength={MAX_REASON_LENGTH}
              />
              {errors.reason && (
                <p className="text-red-500 text-sm mt-1" role="alert">{errors.reason}</p>
              )}
            </div>

            <div className={`text-xs mb-6 ${reason.length > MAX_REASON_LENGTH * 0.9 ? 'text-amber-600' : 'text-gray-500'}`}>
              {characterCount}
            </div>

            <div className="flex justify-end space-x-3">
              <motion.button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDisabled}
                variants={animationVariants.button}
                whileHover="hover"
                whileTap="tap"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isDisabled || !isFormValid}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[120px] justify-center"
                variants={animationVariants.button}
                whileHover="hover"
                whileTap="tap"
              >
                {isSubmitting && (
                  <Icon icon="eos-icons:loading" className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? 'Withdrawing...' : 'Withdraw Offer'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default React.memo(WithdrawModal);