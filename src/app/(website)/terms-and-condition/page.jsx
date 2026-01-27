"use client"
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
export default function TermsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By accessing and using TechBuy, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.'
    },
    {
      title: 'User Accounts',
      content: 'When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms. You are responsible for safeguarding the password and for all activities under your account.'
    },
    {
      title: 'Buying and Selling',
      content: 'All transactions are subject to our verification process. We reserve the right to refuse service, terminate accounts, or cancel orders at our discretion. Prices are subject to change without notice.'
    },
    {
      title: 'Product Quality',
      content: 'All refurbished devices undergo rigorous testing and quality checks. We provide detailed condition reports for each device. However, as these are pre-owned devices, some wear and tear is to be expected.'
    },
    {
      title: 'Payment Terms',
      content: 'Payment must be made at the time of purchase. We accept various payment methods including credit cards, debit cards, and digital wallets. All payments are processed securely.'
    },
    {
      title: 'Limitation of Liability',
      content: 'TechBuy shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <Icon icon="mdi:file-document" className="text-6xl text-primary-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
        <p className="text-gray-600">Last updated: January 26, 2026</p>
      </motion.div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="text-primary-400" />
              {section.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">{section.content}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 p-6 bg-primary-50 rounded-xl"
      >
        <p className="text-gray-700">
          <strong>Contact Us:</strong> If you have any questions about these Terms and Conditions, please contact us at support@techbuy.com
        </p>
      </motion.div>
    </motion.div>
  );
};
