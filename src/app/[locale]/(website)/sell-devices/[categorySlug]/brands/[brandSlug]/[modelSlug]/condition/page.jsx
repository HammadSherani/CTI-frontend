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
  const { categorySlug, brandSlug, modelSlug } = useParams();
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  const modelName = modelSlug?.replace(/-/g, ' ');

  useEffect(() => {
    if (!brandSlug || !modelSlug) return;

    const saved = sessionStorage.getItem('sell_device_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const decodeCompare = (a, b) => decodeURIComponent(a || '').toLowerCase() === decodeURIComponent(b || '').toLowerCase();
        if (decodeCompare(parsed.brand, brandSlug) && decodeCompare(parsed.model, modelSlug)) {
          setDeviceInfo(parsed);
          setAnswers(parsed.answers || {});

          axiosInstance.get(`/public/sell-device/config/${brandSlug}/${modelSlug}`)
            .then(res => {
              const fetchedQuestions = res.data.data.categoryQuestions || [];
              setQuestions(fetchedQuestions);

              // Removed auto redirect
              // if (fetchedQuestions.length === 0) {
              //   router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}/${modelSlug}/upload-media`);
              // }
            })
            .catch(err => {
              console.error(err);
              toast.error("Failed to load category questions.");
            })
            .finally(() => {
              setLoading(false);
            });

        } else {
          router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}/${modelSlug}`);
        }
      } catch (e) {
        console.error(e);
        router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}/${modelSlug}`);
      }
    } else {
      router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}/${modelSlug}`);
    }
  }, [brandSlug, modelSlug, categorySlug, router]);

  const handleOptionSelect = (questionText, optionVal) => {
    const newAnswers = { ...answers, [questionText]: optionVal };
    setAnswers(newAnswers);

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
      router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}/${modelSlug}`);
    }
  };

  if (loading || !deviceInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const hasQuestions = questions && questions.length > 0;
  const currentQuestion = hasQuestions ? questions[currentQuestionIdx] : null;

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
                    if (step.id === 1) router.push(`/sell-devices/${categorySlug}/brands`);
                    if (step.id === 2) router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}`);
                    if (step.id === 3) router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}/${modelSlug}`);
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

        {/* Two Column Layout or Empty State */}
        {!hasQuestions ? (
          <div className="max-w-4xl mx-auto space-y-6 text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-xs p-8">
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="lucide:check-circle" className="text-3xl" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">No Condition Assessment Required</h2>
            <p className="text-gray-500">This model does not require any specific condition assessment. You can proceed to upload media.</p>
            <div className="flex justify-center mt-6 gap-4">
              <button
                onClick={handlePreviousQuestion}
                className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}/${modelSlug}/upload-media`)}
                className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Continue to Upload Media</span>
                <Icon icon="lucide:arrow-right" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left Column: Questions & Options */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
                {/* Question Header */}
                <div>
                  <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                    Question {currentQuestionIdx + 1} of {questions.length}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-2">
                    {currentQuestion.questionText}
                  </h2>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = answers[currentQuestion.questionText] === opt.value;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(currentQuestion.questionText, opt.value)}
                        className={`group relative text-left p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col gap-2 ${isSelected
                            ? 'border-primary-500 bg-primary-50/20 shadow-xs'
                            : 'border-gray-100 bg-white hover:border-primary-200 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className={`font-bold ${isSelected ? 'text-primary-700' : 'text-gray-800 group-hover:text-primary-600'}`}>
                            {opt.label || opt.value}
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 group-hover:border-primary-300'
                            }`}>
                            {isSelected && <Icon icon="lucide:check" className="text-white text-xs font-bold" />}
                          </div>
                        </div>
                        {opt.deductionPercentage > 0 && (
                          <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-md inline-block w-fit">
                            Value affects
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-xs"
                >
                  <Icon icon="lucide:arrow-left" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!answers[currentQuestion.questionText]}
                  onClick={() => {
                    if (currentQuestionIdx < questions.length - 1) {
                      setCurrentQuestionIdx(currentQuestionIdx + 1);
                    } else {
                      router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}/${modelSlug}/upload-media`);
                    }
                  }}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-xs transition-all duration-200 ${answers[currentQuestion.questionText]
                      ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md hover:-translate-y-0.5'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <span>{currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'Upload Media'}</span>
                  <Icon icon="lucide:chevron-right" />
                </button>
              </div>
            </div>

            {/* Right Column: Summary Panel */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon icon="lucide:clipboard-list" className="text-primary-500" />
                  Assessment Summary
                </h3>
                <div className="space-y-4">
                  {questions.map((q, idx) => {
                    const ans = answers[q.questionText];
                    const isCurrent = idx === currentQuestionIdx;
                    return (
                      <div key={idx} className={`relative pl-4 border-l-2 py-1 ${ans ? 'border-primary-500' : isCurrent ? 'border-gray-300' : 'border-gray-100'
                        }`}>
                        <p className={`text-xs font-semibold ${ans ? 'text-gray-900' : isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>
                          {q.questionText}
                        </p>
                        {ans && (
                          <p className="text-sm font-bold text-primary-600 mt-0.5 flex items-center gap-1">
                            <Icon icon="lucide:check-circle-2" className="text-xs" />
                            {q.options.find(o => o.value === ans)?.label || ans}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Device Details (Displayed always at bottom if questions exist or replaced) */}
        <div className="mt-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h4 className="font-black text-gray-900 text-lg">Device Details</h4>
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
  );
}
