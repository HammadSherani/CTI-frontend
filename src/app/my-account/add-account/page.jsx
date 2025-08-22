'use client';
import React from 'react';
import Button from '@/components/ui/button';
import { FileUpload } from '@/components/ui/FileUpload';
import { FormSelect } from '@/components/ui/FormSelect';
import { FormInput } from '@/components/ui/FromInput';
import { TextArea } from '@/components/ui/TextArea';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-4xl bg-white p-8 md:p-10 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Service Request Details</h1>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <FormInput label="Title" name="title" placeholder="e.g., iPhone screen repair" />
            <FormSelect label="Service Type" name="service_type">
              <option>Pickup & Delivery</option>
              <option>On-site Repair</option>
              <option>Mail-in Service</option>
            </FormSelect>

            <TextArea label="Description" name="description" placeholder="Describe the issue with your device in detail..." className="md:col-span-2" />

            <FormInput label="Brand" name="brand" placeholder="e.g., Apple" />
            <FormInput label="Model" name="model" placeholder="e.g., iPhone 14 Pro" />
            <FormInput label="Color" name="color" placeholder="e.g., Space Black" />
            <FormInput label="Purchase Year" name="purchase_year" type="number" placeholder="e.g., 2023" />

            <FormSelect label="Warranty Status" name="warranty_status">
              <option>Under Warranty</option>
              <option>Out of Warranty</option>
              <option>Not Sure</option>
            </FormSelect>
            <FormSelect label="Urgency" name="urgency">
              <option>Low</option>
              <option>Medium</option>
              <option>High - Urgent</option>
            </FormSelect>

            {/* Budget */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Budget</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput name="budget_min" placeholder="Min" type="number" />
                <FormInput name="budget_max" placeholder="Max" type="number" />
                <FormSelect name="budget_currency">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>PKR</option>
                </FormSelect>
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="md:col-span-2">
                  <FormInput label="Address" name="address" placeholder="123 Main Street" />
                </div>
                <FormInput label="City" name="city" placeholder="New York" />
                <FormInput label="District" name="district" placeholder="Manhattan" />
                <FormInput label="Zip Code" name="zip_code" placeholder="10001" />
              </div>
            </div>

            {/* File Upload */}
            <FileUpload label="Image of the Device" name="device_image" />
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
            <Button type="submit" className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
