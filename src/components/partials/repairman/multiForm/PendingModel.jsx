"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PendingApprovalModal({ isOpen, onClose }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Auto redirect after 5 seconds
  useEffect(() => {
    if (!isOpen) return;

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/repair-man/dashboard');
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [isOpen, router]);

  // Reset countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
        router.push('/repair-man/dashboard');
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, router]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with Blur Effect - YEH LO CORRECT */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity"
        onClick={() => {
          onClose();
          router.push('/repair-man/dashboard');
        }}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-2xl transition-all animate-fade-in border border-white/20">
          
          {/* Close Button */}
          <button
            onClick={() => {
              onClose();
              router.push('/repair-man/dashboard');
            }}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors bg-white/50 rounded-full p-1 hover:bg-white/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Success Icon with Animation */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-4 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Heading */}
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Profile Completed Successfully! 🎉
          </h3>

          {/* Message */}
          <div className="mt-4 text-center">
            <p className="text-lg text-gray-700 mb-2">
              Your profile is now under review.
            </p>
            <p className="text-base text-gray-600">
              Your account will be approved within{' '}
              <span className="font-semibold text-orange-500">
                12-24 hours
              </span>
            </p>
          </div>

          {/* Status Badge */}
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
              Pending Approval
            </span>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50/90 backdrop-blur-sm border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">What happens next?</span>
              <br />
              Our team will review your documents and verify your information. 
              You will receive an email notification once your account is approved.
            </p>
          </div>

          {/* Auto Redirect Countdown */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Redirecting to dashboard in{' '}
              <span className="font-bold text-orange-500 text-lg">{countdown}</span> seconds
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / 5) * 100}%` }}
            ></div>
          </div>

          {/* Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/repair-man/dashboard');
              }}
              className="w-full inline-flex justify-center rounded-lg border border-transparent bg-orange-500 px-6 py-3 text-base font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors shadow-lg"
            >
              Go to Dashboard Now
            </button>
          </div>

          {/* Timer Note */}
          <p className="mt-4 text-xs text-center text-gray-400">
            Auto redirect in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}