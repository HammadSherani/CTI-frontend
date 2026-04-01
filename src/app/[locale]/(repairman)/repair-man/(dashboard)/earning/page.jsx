'use client'

import axiosInstance from '@/config/axiosInstance'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Icon } from '@iconify/react'
import { useRouter } from '@/i18n/navigation'
import { motion } from 'framer-motion'
// Summary Skeleton
const SummaryCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="flex justify-between items-center mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-xl" />
      <div className="w-8 h-6 bg-gray-200 rounded" />
    </div>
    <div className="w-20 h-4 bg-gray-200 rounded mb-2" />
    <div className="w-16 h-3 bg-gray-200 rounded" />
  </div>
);

// List Skeleton
const WithdrawItemSkeleton = () => (
  <div className="p-6 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="w-24 h-6 bg-gray-200 rounded" />
      <div className="w-20 h-6 bg-gray-200 rounded" />
    </div>

    <div className="bg-gray-100 rounded-xl p-4 mb-4">
      <div className="w-32 h-4 bg-gray-200 rounded mb-2" />
      <div className="grid grid-cols-2 gap-3">
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="w-full h-4 bg-gray-200 rounded" />
      </div>
    </div>

    <div className="flex gap-4">
      <div className="w-24 h-4 bg-gray-200 rounded" />
      <div className="w-6 h-4 bg-gray-200 rounded" />
      <div className="w-24 h-4 bg-gray-200 rounded" />
    </div>
  </div>
);
function RepairmanEarning() {
  const { token } = useSelector((state) => state.auth)
  const [earningsData, setEarningsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  //  Modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    bankName: '',
    branchName: '',
    iban: ''
  })
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  //  Withdraw History state
  const [withdrawHistory, setWithdrawHistory] = useState([])
  const [withdrawSummary, setWithdrawSummary] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const router = useRouter()
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

  //  Fetch Withdraw History Function
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

  //  Pre-fill bank details if available
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

  //  Fetch withdraw history when tab changes to withdraw-history
  useEffect(() => {
    if (activeTab === 'withdraw-history') {
      fetchWithdrawHistory()
    }
  }, [activeTab])

  //  Updated withdraw handler with modal
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

      alert('Withdrawal request submitted successfully! ')

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

  //  Quick withdraw (full balance)
  const handleQuickWithdraw = () => {
    const isPaymentComplete = earningsData?.paymentInfo?.isPaymentInformationCompleted || false

    if (!isPaymentComplete) {
      alert('Please complete your bank details in settings before requesting a withdrawal.')
      return
    }

    setWithdrawAmount(availableBalance.toString())
    setShowWithdrawModal(true)
  }

  //  Handle withdraw button click
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

  const formatCurrency = (amount, currency = 'TRY') => {
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
    currency = 'TRY'
  } = wallet || {}

  //  Payment info check
  const isPaymentInfoComplete = paymentInfo?.isPaymentInformationCompleted || false
  const statsData = [
    {
      label: "Available Balance",
      value: formatCurrency(availableBalance, currency),
      subText: formatCurrency(totalReleased + totalWithdrawn, currency),
      icon: "mdi:wallet-outline",
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600",
      showButton: true,
    },
    {
      label: "Pending Release",
      value: formatCurrency(pendingAmount, currency),
      subText: "Awaiting customer closure",
      icon: "mdi:clock-outline",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "Total Withdrawn",
      value: formatCurrency(totalWithdrawn, currency),
      subText:
        lockedAmount > 0
          ? `Locked: ${formatCurrency(lockedAmount, currency)}`
          : "All clear",
      icon: "mdi:bank-transfer-out",
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600",
    },
  ];

  const summaryHistoryCards = [
    {
      label: "Requested",
      value: withdrawSummary?.requested?.count || 0,
      amount: withdrawSummary?.requested?.amount || 0,
      icon: "mdi:clock-outline",
      color: "text-primary-600",
      bg: "bg-primary-100",
    },
    {
      label: "Processing",
      value: withdrawSummary?.processing?.count || 0,
      amount: withdrawSummary?.processing?.amount || 0,
      icon: "mdi:progress-clock",
      color: "text-primary-600",
      bg: "bg-primary-100",
    },
    {
      label: "Completed",
      value: withdrawSummary?.completed?.count || 0,
      amount: withdrawSummary?.completed?.amount || 0,
      icon: "mdi:check-circle-outline",
      color: "text-primary-600",
      bg: "bg-primary-100",
    },
    {
      label: "Rejected",
      value: withdrawSummary?.rejected?.count || 0,
      amount: withdrawSummary?.rejected?.amount || 0,
      icon: "mdi:close-circle-outline",
      color: "text-primary-600",
      bg: "bg-primary-100",
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>

            <h1 className="text-2xl font-bold text-gray-900">My Earnings</h1>
            <h5>Track your income, withdrawals, and performance in one place.</h5>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Icon icon="solar:refresh-bold" className="w-4 h-4 inline mr-1" />
            Refresh
          </button>
        </div>

        {/*  Payment Info Warning Banner */}
        {!isPaymentInfoComplete && (
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start justify-center gap-3">
              <div className=" p-2 rounded-lg flex-shrink-0">
                <Icon icon="solar:danger-triangle-bold-duotone" className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Bank Details Required</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Please complete your bank account information in settings before you can request a withdrawal. This is required to process your payments securely.
                </p>

              </div>
              <button
                onClick={() => router.push('/repair-man/profile/edit-profile?tab=bank')}
                className="px-4 py-2 border border-gray-300 cursor-pointer text-gray-600 rounded-lg  transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Icon icon="solar:settings-bold" className="w-4 h-4" />
                Complete Bank Details
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'overview'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'withdraw'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Withdraw
          </button>

          <button
            onClick={() => setActiveTab('withdraw-history')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'withdraw-history'
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
              {statsData.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between h-full min-h-[180px] hover:shadow-md transition"
                >

                  {/* TOP CONTENT */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`${item.iconBg} p-2 rounded-lg`}>
                        <Icon icon={item.icon} className={`w-6 h-6 ${item.iconColor}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {item.label}
                      </span>
                    </div>

                    <p className="text-2xl font-bold text-gray-900">
                      {item.value}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {item.subText}
                    </p>
                  </div>

                  {/* BOTTOM ACTION AREA (always reserved) */}
                  {/* <div className="mt-4 h-[36px] flex items-end">
        {item.showButton && availableBalance >= 500 ? (
          <button
            onClick={handleQuickWithdraw}
            disabled={!isPaymentInfoComplete}
            className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-xs font-medium flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:arrow-top-right" className="w-4 h-4" />
            Withdraw Now
          </button>
        ) : (
          <div className="w-full h-full" /> 
        )}
      </div> */}

                </div>
              ))}
            </div>
            {/* Quick Stats Summary */}

            <div className='grid grid-cols-12'>


              <div className="col-span-8 bg-gradient-to-r from-primary-400 to-primary-500 rounded-3xl p-8 text-white flex flex-col justify-between min-h-[180px]">

                <div className="grid grid-cols-12 gap-8 items-center">

                  {/* LEFT CONTENT */}
                  <div className="col-span-12 md:col-span-8 space-y-6">

                    <div>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-white/70 mb-2"
                      >
                        Aggregate earnings since joining CTI Mobile Repair
                      </motion.p>

                      <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-3"
                      >
                        {formatCurrency(totalReleased + totalWithdrawn, currency)}
                      </motion.h2>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Icon icon="mdi:trending-up" className="w-5 h-5" />
                          <span className="font-semibold">+12.5%</span>
                        </div>
                        <span className="text-white/60">from last month</span>
                      </motion.div>
                    </div>

                    {/* Divider with animation */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="h-px bg-gradient-to-r from-white/10 via-white/30 to-white/10 origin-left"
                    />

                    {/* Bottom Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">

                      {/* Lifetime */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-1 group"
                      >
                        <div className="flex items-center gap-2 text-white/70 group-hover:text-white/90 transition-colors">
                          <motion.div
                            animate={{
                              y: [0, -3, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "easeInOut"
                            }}
                          >
                            <Icon icon="mdi:wallet-outline" className="w-5 h-5" />
                          </motion.div>
                          <p className="text-sm font-medium">Lifetime</p>
                        </div>
                        <p className="text-2xl font-semibold tracking-tight text-white">
                          {formatCurrency(totalReleased, currency)}
                        </p>
                      </motion.div>

                      {/* Processing */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-1 group"
                      >
                        <div className="flex items-center gap-2 text-white/70 group-hover:text-white/90 transition-colors">
                          <motion.div
                            animate={{
                              rotate: [0, 360],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "linear"
                            }}
                          >
                            <Icon icon="mdi:progress-clock" className="w-5 h-5" />
                          </motion.div>
                          <p className="text-sm font-medium">Processing</p>
                        </div>
                        <p className="text-2xl font-semibold tracking-tight text-white">
                          {formatCurrency(lockedAmount, currency)}
                        </p>
                      </motion.div>

                      {/* Withdraw Button */}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-end lg:justify-end pt-2"
                    >
                      <motion.button
                        onClick={handleQuickWithdraw}
                        disabled={!isPaymentInfoComplete}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white hover:bg-gray-100 active:bg-gray-200 
                   text-gray-900 font-semibold text-sm px-6 py-3 
                   rounded-2xl transition-all duration-200 
                   shadow-lg shadow-black/30 flex items-center cursor-pointer text-nowrap gap-2 group"
                      >
                        <motion.div

                          animate={{
                            x: [0, 5, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut"
                          }}
                        >
                          <Icon icon="mdi:cash-fast" className="w-5 h-5" />
                        </motion.div>
                        Withdraw Funds
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* RIGHT VISUAL WITH ENHANCED ANIMATIONS */}
                  <div className="col-span-12 md:col-span-4 hidden md:flex justify-center items-center relative">

                    {/* Animated Glow Background */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [0.9, 1.1, 0.9],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }}
                      className="absolute w-56 h-56 bg-gradient-to-br from-white/20 via-white/10 to-transparent blur-3xl rounded-full"
                    />

                    {/* Main Chart Icon Container with Float Animation */}
                    <motion.div
                      initial={{ scale: 0.6, rotate: -10 }}
                      animate={{
                        scale: 1,
                        rotate: 0,
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut"
                      }}
                      className="relative"
                    >
                      <Icon
                        icon="mdi:chart-line-variant"
                        className="w-44 h-44 text-white/90 drop-shadow-2xl"
                      />

                      {/* Rotating ring with pulse effect */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border border-white/20 rounded-full -m-6"
                      />

                      {/* Second ring with opposite rotation */}
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border border-white/10 rounded-full -m-3"
                      />
                    </motion.div>

                    {/* Floating Icons with Continuous Animations */}

                    {/* USD Circle Icon - Bouncing & Rotating */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: [0, -8, 0],
                        rotate: [0, 10, 0, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        delay: 0.8,
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut"
                      }}
                      className="absolute -top-4 -left-6"
                    >
                      <Icon
                        icon="mdi:currency-usd-circle"
                        className="w-10 h-10 text-primary-100 drop-shadow-lg"
                      />
                    </motion.div>

                    {/* Briefcase Icon - Floating with Glow */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{
                        opacity: 1,
                        y: [0, -6, 0],
                        x: [0, 3, 0, -3, 0],
                      }}
                      transition={{
                        delay: 1,
                        duration: 2.5,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut"
                      }}
                      className="absolute bottom-10 right-4"
                    >
                      <motion.div
                        animate={{
                          boxShadow: [
                            "0 0 0px rgba(255,255,255,0)",
                            "0 0 10px rgba(255,255,255,0.5)",
                            "0 0 0px rgba(255,255,255,0)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Icon
                          icon="mdi:briefcase-variant-outline"
                          className="w-9 h-9 text-white/80 drop-shadow-md"
                        />
                      </motion.div>
                    </motion.div>

                    {/* Chart Area Icon - Pulsing & Rotating */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [0.9, 1.1, 0.9],
                        rotate: [0, 5, 0, -5, 0]
                      }}
                      transition={{
                        delay: 1.2,
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut"
                      }}
                      className="absolute top-16 right-14"
                    >
                      <Icon
                        icon="mdi:chart-areaspline"
                        className="w-7 h-7 text-white/60"
                      />
                    </motion.div>

                    {/* Additional Animated Icons for More Visual Interest */}

                    {/* Star Icon - Twinkling Effect */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                        delay: 1.5
                      }}
                      className="absolute top-1/3 -right-2"
                    >
                      <Icon
                        icon="mdi:star-four-points"
                        className="w-4 h-4 text-yellow-300/60"
                      />
                    </motion.div>

                    {/* Arrow Icon - Directional Pulse */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.4, 1, 0.4],
                        x: [0, 5, 0],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        repeatType: "loop",
                        delay: 1.8
                      }}
                      className="absolute bottom-1/3 left-0"
                    >
                      <Icon
                        icon="mdi:trending-up"
                        className="w-5 h-5 text-emerald-400/70"
                      />
                    </motion.div>

                    {/* Small Circle Particles */}
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatType: "loop",
                        delay: 2
                      }}
                      className="absolute -bottom-2 left-1/2"
                    >
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                    </motion.div>
                  </div>
                </div>



              </div>

              {/* Monthly Stats */}
              <div className="col-span-4 bg-white rounded-3xl  p-6 w-full max-w-sm">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-gray-900">
                    This Month Performance
                  </h3>

                  <span className="text-xs bg-gray-300 px-3 py-1 rounded-full">
                    OCT 2023
                  </span>
                </div>

                {/* Stats */}
                <div className="space-y-4">

                  {/* Net Earnings */}
                  <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Icon icon="mdi:currency-usd" className="text-orange-600 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Net Earnings</p>
                      <p className="font-semibold">
                        {formatCurrency(thisMonth?.netEarning || 0, currency)}
                      </p>
                    </div>
                  </div>

                  {/* Total Jobs */}
                  <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Icon icon="mdi:briefcase-outline" className="text-orange-600 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Jobs</p>
                      <p className="font-semibold">
                        {thisMonth?.totalJobs || 0} Repairs
                      </p>
                    </div>
                  </div>

                  {/* Avg Per Job */}
                  <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Icon icon="mdi:chart-line" className="text-orange-600 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">AVG Per Job</p>
                      <p className="font-semibold">
                        {formatCurrency(thisMonth?.avgPerJob || 0, currency)}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white   rounded-lg p-4 border border-gray-300">
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

              <div className="bg-white rounded-lg p-4 border border-gray-300">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Icon icon="solar:wallet-money-bold-duotone" className="w-5 h-5 text-primary-600" />
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
            {/*  Payment Info Warning in Withdraw Tab */}
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
            <div className={`bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition ${!isPaymentInfoComplete ? 'opacity-60 pointer-events-none' : ''
              }`}>

              <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Icon icon="mdi:bank-transfer-out" className="w-5 h-5 text-primary-600" />
                Withdraw Funds
              </h2>

              {/* Balance Card */}
              <div className="grid grid-cols-2 gap-6">

                <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 mb-5">

                  <div className="flex justify-start gap-2  items-center mb-2">
                    <div className="flex flex-col gap-3">
                      <span className="text-md text-gray-700">Available Balance</span>
                      <span className="text-4xl font-bold text-primary-600">
                        {formatCurrency(availableBalance, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600 mt-3 pt-3 border-t border-primary-100">
                    <span>Released: {formatCurrency(totalReleased, currency)}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
                    <Icon icon="mdi:information-outline" className="w-4 h-4" />
                    Minimum withdrawal: {formatCurrency(500, currency)}
                  </div>
                </div>

                {/* Button */}


                {/* Error */}
                {availableBalance < 500 && isPaymentInfoComplete && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    Minimum {formatCurrency(500, currency)} required to withdraw
                  </p>
                )}

                {/* Process Steps */}
                <div className="">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">
                    Withdrawal Process
                  </h3>

                  <div className="space-y-3">
                    {[
                      "Request submitted for admin review",
                      "Approved within 24-48 hours",
                      "Transferred in 3-5 business days",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Icon icon="mdi:check-circle-outline" className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleWithdrawClick}
                    disabled={availableBalance < 500 || !isPaymentInfoComplete}
                    className="w-full px-4 py-3 bg-primary-600 text-white mt-4 rounded-xl hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Icon icon="mdi:arrow-up-right" className="w-5 h-5" />
                    Request Withdrawal
                  </button>
                </div>


              </div>
            </div>


          </>
        )}

  {activeTab === "withdraw-history" && (
  <>
    {/* SUMMARY */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {historyLoading
        ? Array(4).fill(0).map((_, i) => <SummaryCardSkeleton key={i} />)
        : summaryHistoryCards.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">

              <div className="flex items-center justify-between mb-3">
                <div className={`${item.bg} p-2 rounded-xl`}>
                  <Icon icon={item.icon} className={`w-5 h-5 ${item.color}`} />
                </div>

                <span className="text-2xl font-bold text-gray-900">
                  {item.value}
                </span>
              </div>

              <p className="text-sm font-medium text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(item.amount, currency)}
              </p>
            </div>
          ))}
    </div>

    {/* HISTORY */}
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

      {/* HEADER */}
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon icon="mdi:history" className="w-5 h-5 text-gray-600" />
            Withdrawal History
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Track all your transactions
          </p>
        </div>

        <button
          onClick={fetchWithdrawHistory}
          disabled={historyLoading}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm flex items-center gap-2 hover:bg-gray-50 transition"
        >
          <Icon icon="mdi:refresh" className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* CONTENT */}
      {historyLoading ? (
        <div className="divide-y divide-gray-100">
          {Array(4).fill(0).map((_, i) => (
            <WithdrawItemSkeleton key={i} />
          ))}
        </div>
      ) : withdrawHistory.length === 0 ? (
        <div className="p-16 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="mdi:wallet-outline" className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium mb-1">
            No Withdrawal History
          </p>
          <p className="text-gray-500 text-sm">
            Your withdrawal requests will appear here
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {withdrawHistory.map((item) => (
            <div key={item._id} className="p-6 transition">

              {/* TOP */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">

                  <div className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1
                    ${item.status === "completed"
                      ? "bg-green-50 text-green-700"
                      : item.status === "processing"
                      ? "bg-orange-50 text-orange-700"
                      : item.status === "rejected"
                      ? "bg-red-50 text-red-700"
                      : "bg-blue-50 text-blue-700"}`}>

                    <Icon icon="mdi:check-circle-outline" className="w-4 h-4" />
                    {item.status}
                  </div>

                  <span className="text-xs text-gray-400">
                    {item.earningsCount} earning
                  </span>
                </div>

                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(item.amount, currency)}
                </p>
              </div>

              {/* BANK */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="mdi:bank-outline" className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700">
                    Bank Details
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Bank</p>
                    <p className="font-medium">{item.bankDetails.bankName}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Account</p>
                    <p className="font-medium font-mono">
                      {item.bankDetails.accountNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div>
                  <p className="text-gray-400">Requested</p>
                  <p className="font-medium">
                    {new Date(item.requestedAt).toLocaleDateString()}
                  </p>
                </div>

                <Icon icon="mdi:arrow-right" className="w-4 h-4 text-gray-300" />

                {item.processedAt && (
                  <div>
                    <p className="text-gray-400">Processed</p>
                    <p className="font-medium">
                      {new Date(item.processedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* NOTE */}
              {item.adminNote && (
                <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
                  <Icon icon="mdi:message-text-outline" className="w-4 h-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    {item.adminNote}
                  </p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  </>
)}
      </div>

      {/*  WITHDRAWAL MODAL (only shows if payment info complete) */}
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

              {/* Processing Fee Display */}
              {withdrawAmount && parseFloat(withdrawAmount) >= 500 && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">Withdrawal Amount:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(parseFloat(withdrawAmount), currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">Processing Fee (3.5%):</span>
                    <span className="font-semibold text-red-600">
                      - {formatCurrency(parseFloat(withdrawAmount) * 0.035, currency)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">You'll Receive:</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(parseFloat(withdrawAmount) * 0.965, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details - Read Only */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Icon icon="solar:card-bold-duotone" className="w-5 h-5 text-primary-600" />
                  Bank Details
                </h4>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Branch Name</label>
                    <p className="text-sm font-medium text-gray-900">{bankDetails.branchName || 'N/A'}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <label className="block text-xs text-gray-500 mb-1">Bank Name</label>
                    <p className="text-sm font-medium text-gray-900">{bankDetails.bankName || 'N/A'}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <label className="block text-xs text-gray-500 mb-1">Account Number</label>
                    <p className="text-sm font-medium text-gray-900 font-mono">{bankDetails.accountNumber || 'N/A'}</p>
                  </div>

                  {bankDetails.iban && (
                    <div className="border-t border-gray-200 pt-3">
                      <label className="block text-xs text-gray-500 mb-1">IBAN</label>
                      <p className="text-sm font-medium text-gray-900 font-mono">{bankDetails.iban}</p>
                    </div>
                  )}
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