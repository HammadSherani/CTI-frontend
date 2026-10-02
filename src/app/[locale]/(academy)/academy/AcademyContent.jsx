'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useRouter } from '@/i18n/navigation';
import AcademyMarquee from '@/components/partials/academy/AcademyMarquee';

export default function AcademyContent() {

  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* Section 1 HeroSection */}
      <section className="py-10  px-6 bg-gradient-to-b from-white to-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto flex p-4 flex-col md:flex-row items-start justify-between"
        >
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl font-bold mb-4"> <span className='text-primary-400'>CTI</span> Academy is here for you!</h1>
            <h1 className="text-xl font-semibold mb-4 pt-2">Your complete guide to the tech ecosystem!</h1>
            <p className="mb-6">Discover everything about mobile repair, buying and selling used or new devices, and connecting repairmen with customers. CTI Academy provides you with all the knowledge to succeed as a seller, repairman, or a customer looking for the best tech deals.</p>
            <div className="flex space-x-4">
              <button onClick={() => router.push('academy/academy-listing')} className="bg-primary-500 text-white px-6 py-3 rounded-full hover:bg-primary-600">View All trainings</button>
              {/* <button className="bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-900">Promotional Video</button> */}
            </div>
          </div>
          <div className="md:w-1/2">
            <Image src="/assets/academy/1.png" alt="Computer" width={600} height={400} className="rounded-lg " />
          </div>
        </motion.div>
      </section>


      {/* Section 2  */}
      <div className="mb-4">
        <AcademyMarquee />
      </div>



      {/* Section 3 */}
      <section className="py-10 px-6  bg-white">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-center  justify-between"
        >
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl font-bold mb-4"> For <span className='text-primary-400'>Repairmen & Customers</span></h1>
            <p className="mb-6">Are you a repairman? Get verified and connect with thousands of local customers who need mobile or tech repairs. As a customer, you can easily post a repair job, find the best local technicians, and get your broken screens or devices fixed quickly and reliably.</p>

          </div>
          <div className="md:w-1/2">
            <Image src="/assets/academy/2.png" alt="Computer" width={600} height={400} className="rounded-lg " />
          </div>
        </motion.div>
      </section>






      {/* Section4 */}
      <section className="py-10 px-6  bg-white">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-center  justify-between"
        >
          <div className="md:w-1/2">
            <Image src="/assets/academy/3.png" alt="Computer" width={600} height={400} className="rounded-lg " />
          </div>
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl font-bold mb-4"> Buy & Sell <span className='text-primary-400'>Mobiles</span></h1>
            <p className="mb-6">Sellers can list their inventory of new and used devices, reaching a vast audience of buyers. Customers can easily find great deals on premium refurbished devices, or instantly valuate and sell their old phones for cash. CTI brings everyone together!</p>

          </div>

        </motion.div>
      </section>



      {/* Academy Policies & Guidelines Section */}
      <section className="py-12 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="prose prose-lg max-w-none text-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Academy Policies, Terms, and Guidelines
            </h2>
            <p className="leading-relaxed mb-6">
              Welcome to the CTI Academy informational hub. Here you will find all the rules, regulations, and best practices expected from repairmen, sellers, and customers within our tech ecosystem. Our priority is to maintain a safe, transparent, and high-quality environment for everyone.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Repairman Standards & Verification
            </h3>
            <p className="leading-relaxed mb-4">
              All repairmen operating on CTI must undergo a strict verification process. This includes background checks and validation of technical certifications. By participating in our ecosystem, repairmen agree to:
            </p>
            <ul className="list-disc list-outside space-y-2 pl-6 mb-8 text-gray-700">
              <li>Use high-quality, genuine, or OEM-equivalent parts for all repairs.</li>
              <li>Provide transparent pricing without hidden fees.</li>
              <li>Ensure customer data privacy during the repair process.</li>
              <li>Offer a minimum warranty on hardware replacements.</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Seller Quality Checks & Refurbishment
            </h3>
            <p className="leading-relaxed mb-4">
              Sellers listing refurbished or used devices must adhere to CTI's 32-point quality check. Any device sold on our platform is expected to match its listed condition (Fair, Good, Superb). Sellers must:
            </p>
            <ul className="list-disc list-outside space-y-2 pl-6 mb-8 text-gray-700">
              <li>Accurately declare the battery health and screen condition.</li>
              <li>Ensure the device is factory reset and completely wiped of previous user data.</li>
              <li>Provide a clear return policy (e.g., 15-day replacement) for defective items.</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Customer Responsibilities & Protection
            </h3>
            <p className="leading-relaxed mb-4">
              As a customer, your rights are protected by CTI’s robust support system. However, we also expect customers to engage responsibly when buying, selling, or booking repairs. Before selling your device, always ensure you have backed up your data and logged out of your iCloud/Google accounts. When booking a repair, provide accurate details regarding the damage so our technicians can quote you correctly.
            </p>
          </div>
        </div>
      </section>

      {/* Become a Seller Banner */}
      <section className="py-8 px-6 bg-gradient-to-r from-primary-400 to-primary-600 text-white text-center">
        <p className="mb-4">To access all features, you must be a registered CTI user. Click below to start your journey.</p>
        <button className="bg-white text-purple-500 px-6 py-3 rounded-full hover:bg-gray-100" onClick={() => router.push('/academy/academy-listing')}>Go to Academy listing page</button>
      </section>


    </div>
  );
}
