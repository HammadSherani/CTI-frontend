'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

export default function AdminAdSettingsPage() {
  const { token } = useSelector(s => s.auth);

  const [settings, setSettings] = useState({
    costPerClick: 0,
    costPerThousandImpressions: 0,
    minDailyBudget: 0,
    minTotalBudget: 0,
    isEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchSettings = async () => {
      try {
        const { data } = await axiosInstance.get('/admin/e-commerce/ads/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success && data.data) {
          setSettings(data.data);
        }
      } catch (err) {
        toast.error('Failed to load ad settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axiosInstance.put('/admin/e-commerce/ads/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success('Settings updated successfully');
        setSettings(data.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon icon="svg-spinners:3-dots-fade" className="w-8 h-8 text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-black text-slate-900">Advertisement Settings</h1>
          <p className="text-sm text-slate-400 mt-0.5">Configure global pricing and limits for seller campaigns</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8">
          
          {/* Module Toggle */}
          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 text-violet-600">
              <Icon icon="mdi:power" className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">Enable Advertisements</h3>
              <p className="text-xs text-slate-500 mt-1">If disabled, sellers will not be able to create new campaigns, and existing ones will be paused.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input type="checkbox" name="isEnabled" checked={settings.isEnabled} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Pricing */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Icon icon="mdi:cash-multiple" className="w-5 h-5 text-slate-400" />
              Base Pricing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cost Per Click (CPC)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    name="costPerClick"
                    value={settings.costPerClick}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Amount charged for each valid ad click.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cost Per Mille (CPM)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    name="costPerThousandImpressions"
                    value={settings.costPerThousandImpressions}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Amount charged for 1,000 ad impressions.</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Budget Limits */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Icon icon="mdi:bank-outline" className="w-5 h-5 text-slate-400" />
              Budget Limits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Minimum Daily Budget</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    name="minDailyBudget"
                    value={settings.minDailyBudget}
                    onChange={handleChange}
                    step="0.1"
                    min="1"
                    required
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Minimum spend per day required for any campaign.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Minimum Total Budget</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    name="minTotalBudget"
                    value={settings.minTotalBudget}
                    onChange={handleChange}
                    step="1"
                    min="5"
                    required
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Minimum lifetime budget for a single campaign.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Icon icon="svg-spinners:180-ring-with-bg" className="w-5 h-5" />
              ) : (
                <Icon icon="mdi:content-save" className="w-5 h-5" />
              )}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
