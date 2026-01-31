"use client";

import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function AcademyIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Academy</h1>
              <p className="text-gray-600 mt-1">Manage academy categories and ACE management</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/academy/academy-categories" className="px-3 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2">
                <Icon icon="mdi:shape-outline" className="w-4 h-4" />
                Academy Categories
              </Link>
              <Link href="/admin/academy/ace-management" className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg flex items-center gap-2">
                <Icon icon="mdi:warehouse" className="w-4 h-4" />
                ACE Management
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-700">Select a section from the top-right to manage academy items.</p>
        </div>
      </div>
    </div>
  );
}
