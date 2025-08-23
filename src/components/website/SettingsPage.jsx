'use client';
import { Icon } from '@iconify/react';
import { useState, useMemo } from 'react';
import Button from '../ui/button';
import Link from 'next/link';

// Sample data for tasks
const TASKS_DATA = [
  {
    id: 1,
    title: 'Design UI Mockups for Dashboard',
    description: 'Create high-fidelity mockups for the new user dashboard page using Figma. Focus on a clean and intuitive layout.',
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    tags: ['UI/UX', 'Design', 'Figma'],
  },
  {
    id: 2,
    title: 'API Integration for Payment Gateway',
    description: 'Integrate Stripe API to handle user subscriptions and one-time payments. Ensure all endpoints are secure.',
    startTime: '2:00 PM',
    endTime: '5:30 PM',
    tags: ['Development', 'API', 'High Priority'],
  },
  {
    id: 3,
    title: 'Weekly Team Sync-Up',
    description: 'Discuss project progress, identify any blockers, and plan tasks for the upcoming sprint with the development team.',
    startTime: '9:00 AM',
    endTime: '9:45 AM',
    tags: ['Meeting', 'Planning'],
  },
];

// Task Card Component
const TaskCard = ({ task }) => (
  <div className="bg-gray-50/80 border border-gray-200/80 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
    <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
    <p className="text-gray-600 text-sm my-2 leading-relaxed">{task.description}</p>
    <div className="flex flex-wrap gap-2 mt-4">
      {task.tags.map((tag) => (
        <span 
          key={tag} 
          className="px-3 py-1 text-xs font-semibold text-orange-600 bg-orange-50 rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
    <div className="text-xs text-gray-500 border-t border-gray-200/80 pt-3 mt-4">
      <span className="font-medium text-gray-600">Timeframe:</span> {task.startTime} - {task.endTime}
    </div>
  </div>
);

// Tasks Tab Content
const TasksTabContent = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-800 mb-6">My Tasks</h1>
    <div className="space-y-4">
      {TASKS_DATA.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  </div>
);

// Add Account Tab Content
const AddAccountTabContent = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Account</h1>
    <p className="text-gray-500 mb-6">Connect a new account to sync your data across platforms.</p>
    <Link href="/my-account/add-account">
      <Button className="px-5 py-2 bg-orange-500 font-semibold rounded-lg shadow-sm hover:bg-orange-600 transition-colors">
        Add Account
      </Button>
    </Link>
  </div>
);

// Sidebar Button Component
const SidebarButton = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
      ${isActive 
        ? 'bg-orange-50 text-orange-500' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }`}
  >
    <Icon icon={item.icon} className="w-5 h-5" />
    <span>{item.label}</span>
  </button>
);

// Main Settings Page Component
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('tasks');

  // Dynamic tab configuration with content mapping
  const tabConfig = useMemo(() => ({
    tasks: {
      id: 'tasks',
      label: 'My Tasks',
      icon: 'mdi:checkbox-marked-circle-outline',
      content: <TasksTabContent />
    },
    account: {
      id: 'account',
      label: 'Add Account',
      icon: 'mdi:account-plus-outline',
      content: <AddAccountTabContent />
    }
  }), []);

  // Get navigation items from tab config
  const sidebarNavItems = useMemo(() => 
    Object.values(tabConfig).map(({ id, label, icon }) => ({ id, label, icon })),
    [tabConfig]
  );

  // Get current tab content
  const currentTabContent = tabConfig[activeTab]?.content || null;

  return (
    <div className="w-full">
      <div className="grid grid-cols-[260px_1fr] h-[80vh] rounded-xl bg-white shadow-lg overflow-hidden">
        
        {/* Sidebar */}
        <aside className="h-full bg-gray-50/50 border-r border-gray-200">
          <nav className="p-6 space-y-2">
            {sidebarNavItems.map((item) => (
              <SidebarButton
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="h-full overflow-y-auto p-8">
          {currentTabContent || (
            <div className="text-center text-gray-500 mt-8">
              <p>Tab content not found</p>
            </div>
          )}
        </main>
        
      </div>
    </div>
  );
}