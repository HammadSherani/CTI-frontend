"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import Breadcrumb from '@/components/ui/Breadcrumb';

const STEP_ITEMS = [
  { id: 1, name: 'Brand' },
  { id: 2, name: 'Model' },
  { id: 3, name: 'Storage' },
  { id: 4, name: 'Condition' },
  { id: 5, name: 'Upload Media' },
  { id: 6, name: 'Quote' },
  { id: 7, name: 'Booking' },
];

const QUESTIONS = [
  {
    id: 'power',
    question: 'Does the device turn on and off normally?',
    description: 'Ensure the device successfully boots to the home screen and can power off.',
    options: [
      { value: 'yes', label: 'Yes', description: 'Powers on and off without any issues', icon: 'lucide:power' },
      { value: 'restarts', label: 'Restarts Randomly', description: 'Powers on but restarts or freezes sometimes', icon: 'lucide:refresh-cw' },
      { value: 'no', label: 'No', description: 'Does not power on or is stuck on boot logo', icon: 'lucide:power-off' }
    ]
  },
  {
    id: 'screen',
    question: 'What is the condition of the screen?',
    description: 'Check for physical scratches, cracks, or faulty touch responses.',
    options: [
      { value: 'flawless', label: 'Flawless', description: 'No scratches or cracks at all', icon: 'lucide:sparkles' },
      { value: 'scratched', label: 'Scratched', description: 'Minor visible scratches, but no cracks', icon: 'lucide:info' },
      { value: 'cracked', label: 'Cracked / Faulty Touch', description: 'Glass broken, touch issues, or display lines', icon: 'lucide:slash' }
    ]
  },
  {
    id: 'body',
    question: 'What is the condition of the phone body?',
    description: 'Check side frames, back panel, and camera glass for damage.',
    options: [
      { value: 'like_new', label: 'Like New', description: 'No dents, scratches, or color fading', icon: 'lucide:award' },
      { value: 'minor_dents', label: 'Minor Scratches / Dents', description: 'Few visible scratches or minor signs of use', icon: 'lucide:shield-alert' },
      { value: 'heavy_damage', label: 'Heavy Damage / Cracks', description: 'Bent frame, cracked back panel, or heavy dents', icon: 'lucide:frown' }
    ]
  },
  {
    id: 'battery',
    question: 'What is the battery health condition?',
    description: 'Check battery health percentage or performance under load.',
    options: [
      { value: 'good', label: 'Good / Excellent', description: 'Battery health above 80% or holds charge well', icon: 'lucide:battery-charging' },
      { value: 'degraded', label: 'Degraded', description: 'Discharges quickly or health is below 80%', icon: 'lucide:battery-warning' },
      { value: 'swollen', label: 'Swollen / Bad', description: 'Battery swollen, physically pushes screen, or fails to charge', icon: 'lucide:battery-low' }
    ]
  },
  {
    id: 'camera',
    question: 'Are the front and rear cameras working?',
    description: 'Test both cameras, focus speed, flash, and check lens condition.',
    options: [
      { value: 'all_working', label: 'Fully Working', description: 'Both cameras take clear pictures and focus well', icon: 'lucide:camera' },
      { value: 'partial_faulty', label: 'Partially Faulty', description: 'One camera has focus issues, or lens is scratched', icon: 'lucide:camera-off' },
      { value: 'not_working', label: 'Not Working', description: 'Cameras fail to open, show black screen or error', icon: 'lucide:ban' }
    ]
  },
  {
    id: 'connectivity',
    question: 'Are Wi-Fi, Bluetooth, and SIM networks working?',
    description: 'Verify network signal search, Wi-Fi connectivity, and Bluetooth pairing.',
    options: [
      { value: 'all_working', label: 'Everything Works', description: 'Calls connect fine, Wi-Fi and Bluetooth work normally', icon: 'lucide:wifi' },
      { value: 'faulty_wifi_bt', label: 'Faulty Wi-Fi / Bluetooth', description: 'Cannot connect to Wi-Fi or Bluetooth devices', icon: 'lucide:wifi-off' },
      { value: 'no_signal', label: 'SIM Network Issue', description: 'Cannot read SIM card or shows no network signal', icon: 'lucide:signal-zero' }
    ]
  },
  {
    id: 'accessories',
    question: 'Which accessories do you have?',
    description: 'Having original accessories can fetch a better price for your device.',
    options: [
      { value: 'all', label: 'Box & Original Charger', description: 'I have the matching box and original charger/cable', icon: 'lucide:package-open' },
      { value: 'charger_only', label: 'Only Original Charger', description: 'I only have the original charger', icon: 'lucide:cable' },
      { value: 'none', label: 'None', description: 'No box or charger available', icon: 'lucide:x-circle' }
    ]
  }
];

export default function ConditionQuestionsPage() {
  const router = useRouter();
  const { brandSlug, modelSlug } = useParams();
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  const modelName = modelSlug?.replace(/-/g, ' ');

  // Load from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('sell_device_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.brand === brandSlug && parsed.model === modelSlug) {
          setDeviceInfo(parsed);
          setAnswers(parsed.answers || {});
        } else {
          router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
        }
      } catch (e) {
        console.error(e);
        router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
      }
    } else {
      router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
    }
  }, [brandSlug, modelSlug, router]);

  const handleOptionSelect = (questionId, optionVal) => {
    const newAnswers = { ...answers, [questionId]: optionVal };
    setAnswers(newAnswers);

    // Save to sessionStorage
    if (deviceInfo) {
      const updated = { ...deviceInfo, answers: newAnswers };
      setDeviceInfo(updated);
      sessionStorage.setItem('sell_device_info', JSON.stringify(updated));
    }

    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      // Go to Upload Media page
      router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}/upload-media`);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    } else {
      // Go back to storage selection
      router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
    }
  };

  if (!deviceInfo) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="px-6 md:px-12 py-3 bg-white border-b border-gray-100">
        <Breadcrumb />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Step Indicator (7 Steps) */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider overflow-x-auto py-2">
            {STEP_ITEMS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    if (step.id === 1) router.push('/sell-old-phone/brands');
                    if (step.id === 2) router.push(`/sell-old-phone/brands/${brandSlug}`);
                    if (step.id === 3) router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
                  }}
                  disabled={step.id > 4}
                  className={`flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${step.id === 4 ? 'text-primary-600' : step.id < 4 ? 'text-primary-500 hover:text-primary-600' : 'text-gray-400'
                    }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step.id === 4 ? 'bg-primary-600 text-white' : step.id < 4 ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                    {step.id < 4 ? '✓' : step.id}
                  </span>
                  {step.name}
                </button>
                {idx < STEP_ITEMS.length - 1 && (
                  <div className={`h-[2px] flex-1 min-w-[20px] mx-2 transition-colors ${step.id < 4 ? 'bg-primary-600' : 'bg-gray-200'
                    }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handlePreviousQuestion}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold transition text-sm cursor-pointer"
          >
            <Icon icon="lucide:chevron-left" />
            <span>Back</span>
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column: Questions & Options */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
              {/* Question Header */}
              <div>
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                  Question {currentQuestionIdx + 1} of {QUESTIONS.length}
                </span>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {QUESTIONS[currentQuestionIdx].question}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {QUESTIONS[currentQuestionIdx].description}
                </p>
              </div>

              {/* Options List */}
              <div className="space-y-4">
                {QUESTIONS[currentQuestionIdx].options.map((opt) => {
                  const isSelected = answers[QUESTIONS[currentQuestionIdx].id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleOptionSelect(QUESTIONS[currentQuestionIdx].id, opt.value)}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${isSelected
                          ? 'border-primary-500 bg-primary-50/10 ring-2 ring-primary-100'
                          : 'border-gray-100 bg-gray-50/50 hover:border-primary-300 hover:bg-white'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary-600 text-white' : 'bg-white text-gray-400 border border-gray-100'
                        }`}>
                        <Icon icon={opt.icon} className="text-xl" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-gray-800 block text-base">{opt.label}</span>
                        <span className="text-gray-400 text-xs mt-0.5 block">{opt.description}</span>
                      </div>
                      {isSelected && (
                        <Icon icon="lucide:check-circle-2" className="text-primary-600 text-xl" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <button
                  onClick={handlePreviousQuestion}
                  className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-bold transition text-sm cursor-pointer"
                >
                  Previous Question
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Device Details */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <h4 className="font-black text-gray-900 text-lg">Mobile Details</h4>
              </div>

              {/* Details List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-semibold">Brand</span>
                  <span className="font-extrabold text-gray-800 capitalize">{brandSlug}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-semibold">Model</span>
                  <span className="font-extrabold text-gray-800 capitalize">{modelName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-semibold">Storage / RAM</span>
                  <span className="font-extrabold text-gray-800">{deviceInfo.storage}</span>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                <Icon icon="lucide:shield-check" className="text-9xl" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:shield-check" className="text-2xl" />
                  <span className="font-extrabold text-sm uppercase tracking-wider">CTI Verified Sell</span>
                </div>
                <p className="text-xs text-primary-100 leading-relaxed font-semibold">
                  Get paid instantly at your doorstep. We guarantee 100% data security and professional device assessment through the CTI platform.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
