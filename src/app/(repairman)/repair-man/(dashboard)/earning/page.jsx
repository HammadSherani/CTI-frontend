'use client'

import axiosInstance from '@/config/axiosInstance'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Icon } from '@iconify/react'

function RepairmanEarning() {
  const { token } = useSelector((state) => state.auth)
  const [earningsData, setEarningsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // ✅ Modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    bankName: '',
    branchName: '',
    iban: ''
  })
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  // ✅ Withdraw History state
  const [withdrawHistory, setWithdrawHistory] = useState([])
  const [withdrawSummary, setWithdrawSummary] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data } = await axiosInstance.get('/repairman/earnings/overview', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      })
      setEarningsData(data.data)
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Fetch Withdraw History Function
  const fetchWithdrawHistory = async () => {
    try {
      setHistoryLoading(true)
      const { data } = await axiosInstance.get('/repairman/earnings/withdraw-history', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      })
      
      console.log('Withdraw History Response:', data)
      
      // Set the withdrawal history data
      setWithdrawHistory(data.data || [])
      setWithdrawSummary(data.summary || null)
      
    } catch (error) {
      console.error('Error fetching withdraw history:', error)
      alert('Failed to load withdrawal history')
    } finally {
      setHistoryLoading(false)
    }
  }

  // ✅ Pre-fill bank details if available
  useEffect(() => {
    if (earningsData?.paymentInfo?.bankDetails && showWithdrawModal) {
      const saved = earningsData.paymentInfo.bankDetails
      setBankDetails({
        accountNumber: saved.accountNumber || '',
        bankName: saved.bankName || '',
        branchName: saved.branchName || '',
        iban: saved.iban || ''
      })
    }
  }, [earningsData, showWithdrawModal])

  // ✅ Fetch withdraw history when tab changes to withdraw-history
  useEffect(() => {
    if (activeTab === 'withdraw-history') {
      fetchWithdrawHistory()
    }
  }, [activeTab])

  // ✅ Updated withdraw handler with modal
  const handleWithdrawSubmit = async () => {
    try {
      setWithdrawLoading(true)

      // Validation
      if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
        alert('Please enter a valid amount')
        return
      }

      if (parseFloat(withdrawAmount) < 500) {
        alert('Minimum withdrawal amount is 500')
        return
      }

      if (parseFloat(withdrawAmount) > availableBalance) {
        alert(`Insufficient balance. Available: ${formatCurrency(availableBalance, currency)}`)
        return
      }

      // Bank details validation
      if (!bankDetails.accountNumber || !bankDetails.bankName || !bankDetails.branchName) {
        alert('Please fill in all required bank details')
        return
      }

      const { data } = await axiosInstance.post('/repairman/earnings/withdraw', {
        amount: parseFloat(withdrawAmount),
        bankDetails
      }, {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      })

      alert('Withdrawal request submitted successfully! ✅')
      
      // Reset form
      setWithdrawAmount('')
      setBankDetails({
        accountNumber: '',
        bankName: '',
        branchName: '',
        iban: ''
      })
      setShowWithdrawModal(false)
      
      // Refresh data
      fetchData()
      
      // Refresh history if on withdraw-history tab
      if (activeTab === 'withdraw-history') {
        fetchWithdrawHistory()
      }

    } catch (error) {
      console.error('Error withdrawing:', error)
      const errorMessage = error.response?.data?.message || 'Failed to submit withdrawal request'
      alert(errorMessage)
    } finally {
      setWithdrawLoading(false)
    }
  }

  // ✅ Quick withdraw (full balance)
  const handleQuickWithdraw = () => {
    const isPaymentComplete = earningsData?.paymentInfo?.isPaymentInformationCompleted || false
    
    if (!isPaymentComplete) {
      alert('Please complete your bank details in settings before requesting a withdrawal.')
      return
    }

    setWithdrawAmount(availableBalance.toString())
    setShowWithdrawModal(true)
  }

  // ✅ Handle withdraw button click
  const handleWithdrawClick = () => {
    const isPaymentComplete = earningsData?.paymentInfo?.isPaymentInformationCompleted || false
    
    if (!isPaymentComplete) {
      return // Modal won't open, warning is already displayed
    }
    
    setShowWithdrawModal(true)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatCurrency = (amount, currency = 'PKR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { wallet, paymentInfo, overview } = earningsData || {}
  const { thisMonth } = overview || {}

  const {
    availableBalance = 0,
    totalReleased = 0,
    totalWithdrawn = 0,
    pendingAmount = 0,
    lockedAmount = 0,
    currency = 'PKR'
  } = wallet || {}

  // ✅ Payment info check
  const isPaymentInfoComplete = paymentInfo?.isPaymentInformationCompleted || false

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Earnings</h1>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Icon icon="solar:refresh-bold" className="w-4 h-4 inline mr-1" />
            Refresh
          </button>
        </div>

        {/* ✅ Payment Info Warning Banner */}
        {!isPaymentInfoComplete && (
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-lg flex-shrink-0">
                <Icon icon="solar:danger-triangle-bold-duotone" className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">Bank Details Required</h3>
                <p className="text-sm text-amber-800 mb-3">
                  Please complete your bank account information in settings before you can request a withdrawal. This is required to process your payments securely.
                </p>
                <button 
                  onClick={() => window.location.href = '/repair-man/profile/edit-profile?tab=bank'}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Icon icon="solar:settings-bold" className="w-4 h-4" />
                  Complete Bank Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'withdraw'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Withdraw
          </button>

          <button
            onClick={() => setActiveTab('withdraw-history')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'withdraw-history'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Withdraw History
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Main Cards - Wallet Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Icon icon="solar:wallet-bold-duotone" className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Available Balance</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(availableBalance, currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Released: {formatCurrency(totalReleased, currency)}
                </p>
                {/* ✅ Quick Withdraw Button with Check */}
                {availableBalance >= 500 && (
                  <button
                    onClick={handleQuickWithdraw}
                    disabled={!isPaymentInfoComplete}
                    className="mt-3 w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Icon icon="solar:export-bold" className="w-3 h-3" />
                    Withdraw Now
                  </button>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Icon icon="solar:clock-circle-bold-duotone" className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Pending Release</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(pendingAmount, currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Awaiting customer closure</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Icon icon="solar:export-bold-duotone" className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Withdrawn</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalWithdrawn, currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {lockedAmount > 0 ? `Locked: ${formatCurrency(lockedAmount, currency)}` : 'All clear'}
                </p>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Earnings (Released + Withdrawn)</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(totalReleased + totalWithdrawn, currency)}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <Icon icon="solar:chart-2-bold-duotone" className="w-10 h-10" />
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div>
                  <p className="opacity-80">Can Withdraw</p>
                  <p className="font-semibold">{formatCurrency(availableBalance, currency)}</p>
                </div>
                <div className="h-8 w-px bg-white/30"></div>
                <div>
                  <p className="opacity-80">Processing</p>
                  <p className="font-semibold">{formatCurrency(lockedAmount, currency)}</p>
                </div>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">This Month's Performance</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-gray-200">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="solar:dollar-bold-duotone" className="w-4 h-4 text-primary-600" />
                    <p className="text-xs text-gray-600">Net Earning</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(thisMonth?.netEarning || 0, currency)}
                  </p>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="solar:graph-up-bold-duotone" className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-gray-600">Total Jobs</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {thisMonth?.totalJobs || 0}
                  </p>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="solar:chart-bold-duotone" className="w-4 h-4 text-primary-600" />
                    <p className="text-xs text-gray-600">Avg Per Job</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(thisMonth?.avgPerJob || 0, currency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">How it works</h3>
                    <p className="text-xs text-gray-600">
                      Earnings are released when customer closes the job. Once released, you can withdraw anytime.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Icon icon="solar:wallet-money-bold-duotone" className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Withdrawal Limit</h3>
                    <p className="text-xs text-gray-600">
                      Minimum withdrawal amount is {formatCurrency(500, currency)}. Processed within 3-5 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'withdraw' && (
          <>
            {/* ✅ Payment Info Warning in Withdraw Tab */}
            {!isPaymentInfoComplete && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
                    <Icon icon="solar:lock-bold-duotone" className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Withdrawal Unavailable</h3>
                    <p className="text-sm text-red-800 mb-4">
                      You must complete your bank account information before requesting a withdrawal. This ensures your payments can be processed securely and efficiently.
                    </p>
                    <button 
                      onClick={() => window.location.href = '/repairman/settings'}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <Icon icon="solar:settings-bold" className="w-5 h-5" />
                      Go to Settings & Add Bank Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Withdraw Section */}
            <div className={`bg-white rounded-lg shadow p-6 ${!isPaymentInfoComplete ? 'opacity-50 pointer-events-none' : ''}`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Withdraw Funds</h2>
              
              <div className="bg-primary-50 rounded-lg p-4 mb-4 border border-primary-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Available Balance</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(availableBalance, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2 pt-2 border-t border-primary-100">
                  <span>Total Released: {formatCurrency(totalReleased, currency)}</span>
                  <span>Locked: {formatCurrency(lockedAmount, currency)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Minimum withdrawal: {formatCurrency(500, currency)}
                </p>
              </div>

              {/* ✅ Updated: Open Modal Button with Check */}
              <button
                onClick={handleWithdrawClick}
                disabled={availableBalance < 500 || !isPaymentInfoComplete}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Icon icon="solar:export-bold" className="w-5 h-5" />
                Request Withdrawal
              </button>
              
              {availableBalance < 500 && isPaymentInfoComplete && (
                <p className="text-xs text-red-600 mt-2 text-center">
                  Insufficient balance. Minimum {formatCurrency(500, currency)} required.
                </p>
              )}

              {/* Withdrawal Process Info */}
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Withdrawal Process</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Request submitted for admin review</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Admin approves within 24-48 hours</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Funds transferred to your account in 3-5 business days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdraw History */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Withdrawal History</h2>
                <span className="text-xs text-gray-500">Recent requests</span>
              </div>
              
              <div className="p-12 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon icon="solar:document-bold-duotone" className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No withdrawal history yet</p>
                <p className="text-gray-400 text-xs mt-1">Your withdrawal requests will appear here</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'withdraw-history' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-100 p-1.5 rounded-lg">
                    <Icon icon="solar:clock-circle-bold-duotone" className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-600">Requested</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {historyLoading ? '...' : withdrawSummary?.requested?.count || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(withdrawSummary?.requested?.amount || 0, currency)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-orange-100 p-1.5 rounded-lg">
                    <Icon icon="solar:refresh-bold-duotone" className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-xs text-gray-600">Processing</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {historyLoading ? '...' : withdrawSummary?.processing?.count || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(withdrawSummary?.processing?.amount || 0, currency)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-100 p-1.5 rounded-lg">
                    <Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {historyLoading ? '...' : withdrawSummary?.completed?.count || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(withdrawSummary?.completed?.amount || 0, currency)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-red-100 p-1.5 rounded-lg">
                    <Icon icon="solar:close-circle-bold-duotone" className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-xs text-gray-600">Rejected</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {historyLoading ? '...' : withdrawSummary?.rejected?.count || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(withdrawSummary?.rejected?.amount || 0, currency)}
                </p>
              </div>
            </div>

            {/* Withdraw History List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Withdrawal History</h2>
                <button
                  onClick={fetchWithdrawHistory}
                  disabled={historyLoading}
                  className="px-3 py-1.5 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors text-xs font-medium flex items-center gap-1"
                >
                  <Icon icon="solar:refresh-bold" className="w-3 h-3" />
                  {historyLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              {historyLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-3"></div>
                  <p className="text-gray-500 text-sm">Loading withdrawal history...</p>
                </div>
              ) : withdrawHistory.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon icon="solar:document-bold-duotone" className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No withdrawal history yet</p>
                  <p className="text-gray-400 text-xs mt-1">Your withdrawal requests will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {withdrawHistory.map((item) => (
                    <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left Section - Main Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                              item.status === 'completed' ? 'bg-green-100 text-green-700' :
                              item.status === 'processing' ? 'bg-orange-100 text-orange-700' :
                              item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              <Icon icon={item.statusBadge?.icon || 'solar:document-bold'} className="w-3.5 h-3.5" />
                              {item.statusBadge?.text || item.status}
                            </div>
                            <span className="text-xs text-gray-500">
                              {item.earningsCount} earning{item.earningsCount !== 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(item.amount, currency)}
                            </p>
                            
                            {/* Bank Details */}
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Icon icon="solar:card-bold" className="w-3.5 h-3.5" />
                              <span>{item.bankDetails.bankName}</span>
                              <span className="text-gray-400">•</span>
                              <span>{item.bankDetails.accountNumber}</span>
                            </div>
                            
                            {item.bankDetails.branchName && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Icon icon="solar:map-point-bold" className="w-3.5 h-3.5" />
                                <span>{item.bankDetails.branchName}</span>
                              </div>
                            )}
                          </div>

                          {/* Admin Note */}
                          {item.adminNote && (
                            <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                              <div className="flex items-start gap-2">
                                <Icon icon="solar:user-bold-duotone" className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-0.5">Admin Note</p>
                                  <p className="text-xs text-gray-600">{item.adminNote}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Section - Dates */}
                        <div className="text-right space-y-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Requested</p>
                            <p className="text-xs font-medium text-gray-900">
                              {new Date(item.requestedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.requestedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          {item.processedAt && (
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Processed</p>
                              <p className="text-xs font-medium text-gray-900">
                                {new Date(item.processedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(item.processedAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          )}

                          {item.expectedReleaseDate && !item.processedAt && (
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Expected</p>
                              <p className="text-xs font-medium text-orange-600">
                                {new Date(item.expectedReleaseDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ✅ WITHDRAWAL MODAL (only shows if payment info complete) */}
      {showWithdrawModal && isPaymentInfoComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Request Withdrawal</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon icon="solar:close-circle-bold" className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Available Balance Display */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
                <p className="text-xs text-gray-600 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(availableBalance, currency)}
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="500"
                    max={availableBalance}
                  />
                  <button
                    onClick={() => setWithdrawAmount(availableBalance.toString())}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary-100 text-primary-600 rounded text-xs font-medium hover:bg-primary-200 transition-colors"
                  >
                    Max
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Min: {formatCurrency(500, currency)} • Max: {formatCurrency(availableBalance, currency)}
                </p>
              </div>

              {/* Bank Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Bank Details</h4>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Branch Name *</label>
                  <input
                    type="text"
                    value={bankDetails.branchName}
                    onChange={(e) => setBankDetails({ ...bankDetails, branchName: e.target.value })}
                    placeholder="Main Branch"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    placeholder="Bank of America"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    placeholder="1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">IBAN (Optional)</label>
                  <input
                    type="text"
                    value={bankDetails.iban}
                    onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                    placeholder="PK12ABCD1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <div className="flex gap-2">
                  <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-700">
                    <p className="font-medium mb-1">Processing Time</p>
                    <p>Your withdrawal will be reviewed within 24-48 hours and processed within 3-5 business days after approval.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawSubmit}
                disabled={withdrawLoading || !withdrawAmount || parseFloat(withdrawAmount) < 500}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {withdrawLoading ? (
                  <>
                    <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:export-bold" className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RepairmanEarning