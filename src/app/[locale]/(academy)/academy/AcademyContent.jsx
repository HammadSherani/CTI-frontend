'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import AcademyMarquee from '@/components/partials/academy/AcademyMarquee';

export default function AcademyContent() {

  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* Section 1 HeroSection */}
      <section className="py-10 px-6 bg-gradient-to-b from-white to-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between"
        >
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-6xl font-bold mb-4"> <span className='text-primary-400'>Integrate</span> Academy is here for you!</h1>
            <h1 className="text-4xl font-semibold mb-4 pt-2">Hundreds of training courses!</h1>
            <p className="mb-6">Hundreds of different types of training courses, enriched with AI-powered content, await you at Trendyol Academy! Easily access all the information you need, anytime and anywhere, and take your business to the next level with personalized experiences tailored to your needs.</p>
            <div className="flex space-x-4">
              <button className="bg-primary-500 text-white px-6 py-3 rounded-full hover:bg-primary-600">Review the trainings</button>
              <button className="bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-900">Promotional Video</button>
            </div>
          </div>
          <div className="md:w-1/2">
            <Image src="/assets/academy/1.webp" alt="Computer" width={600} height={400} className="rounded-lg " />
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
            <h1 className="text-6xl font-bold mb-4"> <span className='text-primary-400'>Integrate</span> Academy is here for you!</h1>
            <p className="mb-6">Hundreds of different types of training courses, enriched with AI-powered content, await you at Trendyol Academy! Easily access all the information you need, anytime and anywhere, and take your business to the next level with personalized experiences tailored to your needs.</p>

          </div>
          <div className="md:w-1/2">
            <Image src="/assets/academy/2.webp" alt="Computer" width={600} height={400} className="rounded-lg " />
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
            <Image src="/assets/academy/3.webp" alt="Computer" width={600} height={400} className="rounded-lg " />
          </div>
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-6xl font-bold mb-4"> <span className='text-primary-400'>Integrate</span> Academy is here for you!</h1>
            <p className="mb-6">Hundreds of different types of training courses, enriched with AI-powered content, await you at Trendyol Academy! Easily access all the information you need, anytime and anywhere, and take your business to the next level with personalized experiences tailored to your needs.</p>

          </div>

        </motion.div>
      </section>



      {/* Become a Seller Banner */}
      <section className="py-8 px-6 bg-gradient-to-r from-primary-400 to-primary-600 text-white text-center">
        <p className="mb-4">To Access Academy Academy, You must be a Trendyol Seller. If you are not a seller, you can become one by clicking the button.</p>
        <button className="bg-white text-purple-500 px-6 py-3 rounded-full hover:bg-gray-100" onClick={() => router.push('/academy/academy-listing')}>Go to Academy listing page</button>
      </section>


    </div>
  );
}