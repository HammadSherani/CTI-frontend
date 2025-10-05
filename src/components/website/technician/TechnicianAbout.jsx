'use client';
import { Icon } from '@iconify/react';

const socialLinks = [
  { icon: 'mdi:facebook', href: '#' },
  { icon: 'pajamas:x', href: '#' },
  { icon: 'mdi:instagram', href: '#' },
  { icon: 'mdi:linkedin', href: '#' },
];

const services = ['Sell Phone', 'Buy Phone', 'Buy Laptops', 'Sell Laptops', 'Phone Repairs', 'Find New Watches', 'Recycle'];

const expertisePoints = [
    { title: 'Premium Quality Build', description: 'Designed with durable materials for long-lasting use.' },
    { title: 'Modern & Minimalist Design', description: 'Looks sleek, feels premium, and suits any setup.' },
    { title: 'User-Friendly Experience', description: 'Easy navigation with smooth performance.' },
    { title: 'Lightweight & Portable', description: 'Take it anywhere, anytime with zero hassle.' },
    { title: 'Versatile Use', description: 'Whether for personal or professional use, it fits perfectly.' },
];

const TechnicianAbout = ({ technician }) => {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content (Left Side) */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">About Us</h2>
                <p className="text-sm text-gray-500 mt-1">About Description</p>
                <div className="mt-4 text-gray-600 space-y-4 leading-relaxed">
                  <p>
                    Experience next-level convenience and style with our latest product — crafted to simplify your daily routine while looking great. Whether you're at home, on the go, or working remotely, this product adapts to your lifestyle and delivers exactly what you need.
                  </p>
                  <p><strong>Why You'll Love It:</strong></p>
                  <p>
                    Level up your experience and discover how small details can make a big difference.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Expertise</h3>
                 <p className="mt-4 text-gray-600 leading-relaxed">
                   Level up your experience and discover how small details can make a big difference.
                  </p>
                <ul className="mt-4 space-y-3">
                  {expertisePoints.map(point => (
                    <li key={point.title} className="flex items-start gap-3">
                      <Icon icon="mdi:check-circle-outline" className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-gray-700">{point.title}</span> - <span className="text-gray-600">{point.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Sidebar (Right Side) */}
          <div className="lg:col-span-1">
             <div className="bg-gray-50 p-6 rounded-lg border border-gray-200/80">
                <h3 className="text-xl font-bold text-gray-800">My Services</h3>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                    {services.map(service => (
                        <a key={service} href="#" className="text-primary-600 hover:underline">{service}</a>
                    ))}
                </div>
                <div className="mt-6 flex items-center gap-4 text-gray-500">
                    {socialLinks.map(link => (
                        <a key={link.icon} href={link.href} className="hover:text-primary-600 transition-colors">
                            <Icon icon={link.icon} className="w-5 h-5" />
                        </a>
                    ))}
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default TechnicianAbout;