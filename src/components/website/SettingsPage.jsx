'use client';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import Button from '../ui/button';
import Link from 'next/link';

const sidebarNavItems = [
  { id: 'tasks', label: 'My Tasks', icon: 'mdi:checkbox-marked-circle-outline' },
  { id: 'account', label: 'Add Account', icon: 'mdi:account-plus-outline' },
];

// Sample data for tasks
const tasksData = [
  {
    title: 'Design UI Mockups for Dashboard',
    description: 'Create high-fidelity mockups for the new user dashboard page using Figma. Focus on a clean and intuitive layout.',
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    tags: ['UI/UX', 'Design', 'Figma'],
  },
  {
    title: 'API Integration for Payment Gateway',
    description: 'Integrate Stripe API to handle user subscriptions and one-time payments. Ensure all endpoints are secure.',
    startTime: '2:00 PM',
    endTime: '5:30 PM',
    tags: ['Development', 'API', 'High Priority'],
  },
   {
    title: 'Weekly Team Sync-Up',
    description: 'Discuss project progress, identify any blockers, and plan tasks for the upcoming sprint with the development team.',
    startTime: '9:00 AM',
    endTime: '9:45 AM',
    tags: ['Meeting', 'Planning'],
  },
];


const TaskCard = ({ title, description, startTime, endTime, tags }) => (
  <div className="bg-gray-50/80 border border-gray-200/80 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
    <h3 className="font-bold text-lg text-gray-800">{title}</h3>
    <p className="text-gray-600 text-sm my-2 leading-relaxed">{description}</p>
    <div className="flex flex-wrap gap-2 mt-4">
      {tags.map((t) => (
        <span key={t} className="px-3 py-1 text-xs font-semibold text-orange-600 bg-orange-50 rounded-full">{t}</span>
      ))}
    </div>
    <div className="text-xs text-gray-500 border-t border-gray-200/80 pt-3 mt-4">
      <span className="font-medium text-gray-600">Timeframe:</span> {startTime} - {endTime}
    </div>
  </div>
);

const SidebarButton = ({ item, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(item.id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
      ${activeTab === item.id ? 'bg-orange-50 text-orange-500' : 'text-gray-600 hover:bg-gray-100'}`}
  >
    <Icon icon={item.icon} className="w-5 h-5" />
    <span>{item.label}</span>
  </button>
);

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div className="w-full ">
      {/* Two columns; fix the overall panel height */}
      <div className="grid grid-cols-[260px_1fr] h-[80vh] rounded-xl bg-white shadow-lg">

        {/* Sidebar: stays at top, keeps its intrinsic height (won’t stretch) */}
        <aside className="self-start p-6 h-full bg-gray-50/50 border-r border-gray-200 rounded-l-xl">
          <nav className="space-y-2">
            {sidebarNavItems.map((item) => (
              <SidebarButton key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
            ))}
          </nav>
        </aside>

        {/* Content: the IMPORTANT bits are min-h-0, h-full, overflow-y-auto */}
        <main className="min-h-0 h-full overflow-y-auto p-8">
          {activeTab === 'tasks' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-6">My Tasks</h1>
              <div className="space-y-4">
                {tasksData.map((task, i) => <TaskCard key={i} {...task} />)}
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Account</h1>
              <p className="text-gray-500 mb-6">Connect a new account to sync your data across platforms.</p>
             <Link href="/my-account/add-account">
               <Button className="px-5 py-2 bg-orange-500 font-semibold rounded-lg shadow-sm">
                Add Account
              </Button>
             </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
