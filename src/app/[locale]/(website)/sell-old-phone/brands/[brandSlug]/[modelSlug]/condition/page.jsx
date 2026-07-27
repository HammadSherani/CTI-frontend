"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

const STEP_ITEMS = [
  { id: 1, name: 'Brand' },
  { id: 2, name: 'Model' },
  { id: 3, name: 'Variants' },
  { id: 4, name: 'Condition' },
  { id: 5, name: 'Upload Media' },
  { id: 6, name: 'Quote' },
  { id: 7, name: 'Booking' },
];

export default function ConditionQuestionsPage() {
  const router = useRouter();
  const { brandSlug, modelSlug } = useParams();
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  const modelName = modelSlug?.replace(/-/g, ' ');

  // Load from sessionStorage and fetch config
  useEffect(() => {
    const saved = sessionStorage.getItem('sell_device_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.brand === brandSlug && parsed.model === modelSlug) {
          setDeviceInfo(parsed);
          setAnswers(parsed.answers || {});
          
          // Fetch questions
          axiosInstance.get(`/public/sell-device/config/${brandSlug}/${modelSlug}`)
            .then(res => {
              const fetchedQuestions = res.data.data.categoryQuestions || [];
              setQuestions(fetchedQuestions);
              
              if (fetchedQuestions.length === 0) {
                // No questions configured, skip this step
                router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}/upload-media`);
              }
            })
            .catch(err => {
              console.error(err);
              toast.error("Failed to load category questions.");
            })
            .finally(() => {
              setLoading(false);
            });
            
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

  const handleOptionSelect = (questionText, optionVal) => {
    const newAnswers = { ...answers, [questionText]: optionVal };
    setAnswers(newAnswers);

    // Save to sessionStorage
    if (deviceInfo) {
      const updated = { ...deviceInfo, answers: newAnswers };
      setDeviceInfo(updated);
      sessionStorage.setItem('sell_device_info', JSON.stringify(updated));
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    } else {
      // Go back to variants selection
      router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
    }
  };

  if (loading || questions.length === 0 || !deviceInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="px-6 md:px-12 py-3 bg-white border-b border-gray-100">
        <Breadcrumb />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Step Indicator */}
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



        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column: Questions & Options */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
              {/* Question Header */}
              <div>
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                  Question {currentQuestionIdx + 1} of {questions.length}
                </span>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options List */}
              <div className="space-y-4">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = answers[currentQuestion.question] === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(currentQuestion.question, opt)}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${isSelected
                          ? 'border-primary-500 bg-primary-50/10 ring-2 ring-primary-100'
                          : 'border-gray-100 bg-gray-50/50 hover:border-primary-300 hover:bg-white'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary-600 text-white' : 'bg-white text-gray-400 border border-gray-100'
                        }`}>
                        <Icon icon="lucide:check-circle" className="text-xl" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-gray-800 block text-base">{opt}</span>
                      </div>
                      {isSelected && (
                        <Icon icon="lucide:check-circle-2" className="text-primary-600 text-xl" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Previous and Next Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handlePreviousQuestion}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition cursor-pointer flex items-center gap-2"
                >
                  <Icon icon="lucide:chevron-left" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => {
                    if (currentQuestionIdx < questions.length - 1) {
                      setCurrentQuestionIdx(currentQuestionIdx + 1);
                    } else {
                      router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}/upload-media`);
                    }
                  }}
                  disabled={!answers[currentQuestion.question]}
                  className="px-8 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <span>{currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'Next Step'}</span>
                  <Icon icon="lucide:chevron-right" />
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
                {deviceInfo.selectedVariants?.map((v, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-semibold">{v.key}</span>
                    <span className="font-extrabold text-gray-800">{v.value}</span>
                  </div>
                ))}
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
