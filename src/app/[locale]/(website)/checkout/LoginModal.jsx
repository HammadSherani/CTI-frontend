'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useRouter } from '@/i18n/navigation';
import axiosInstance from '@/config/axiosInstance';
import { useDispatch } from 'react-redux';
import { setAuth } from '@/store/auth';
import { setCurrentUser } from '@/store/chat';
import { updateFCMToken } from '@/utils/fcm';
import { toast } from 'react-toastify';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
        rememberMe: false,
      });

      const resData = response.data.data;

      if (response.data.requiresVerification) {
        toast.info("Email not verified. Redirecting...");
        router.push(`/auth/verify-email?email=${resData.email}&userId=${resData.userId}`);
        return;
      }

      dispatch(
        setAuth({
          user: resData.user,
          token: resData.token,
          userType: resData.user.role,
        })
      );

      dispatch(setCurrentUser(resData.user));

      try {
        await updateFCMToken(resData.token);
      } catch (fcmError) {
        console.error("FCM update failed", fcmError);
      }

      toast.success("Login successful!");
      onSuccess(resData.user);
      onClose();
    } catch (error) {
      if(error?.response?.status === 401 && error?.response?.data?.message === "Email not verified") {
        const { email: errEmail, userId } = error.response.data.data;
        router.push(`/auth/verify-email?email=${errEmail}&userId=${userId}`);
        return;
      }
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Icon icon="mdi:close" className="text-gray-600" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="mdi:account-circle" className="text-3xl text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Login Required</h2>
          <p className="text-gray-500 text-sm">Please login to complete your order securely.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
            <div className="relative">
              <Icon icon="mdi:email-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
            <div className="relative">
              <Icon icon="mdi:lock-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Icon icon="mdi:loading" className="animate-spin text-lg" /> : <Icon icon="mdi:login" className="text-lg" />}
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
          Don't have an account?{' '}
          <Link href="/auth/register" className="font-bold text-orange-500 hover:text-orange-600 transition-colors">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
